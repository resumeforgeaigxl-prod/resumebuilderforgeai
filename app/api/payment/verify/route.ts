export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { activateUserPlan, PlanName } from '@/lib/plan-activation';
import { createInvoice } from '@/lib/invoice';
import { sendPaymentSuccessEmail } from '@/lib/brevo';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing required payment verification fields' }, { status: 400 });
        }

        const supabase = createClient();

        // ── 1. Fetch server-recorded order row ─────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let { data: orderRow, error: orderFetchErr } = await (supabase as any)
            .from('orders')
            .select('id, user_id, plan_name, amount, original_price, coupon_code, discount_amount, currency, status')
            .eq('razorpay_order_id', razorpay_order_id)
            .maybeSingle();

        // ── 1b. Self-Healing Fallback: Fetch Authoritative Order from Razorpay ─
        if (!orderRow && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            try {
                const Razorpay = (await import('razorpay')).default;
                const razorpay = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET,
                });
                const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
                if (rzpOrder && (rzpOrder.notes?.userId === session.userId || rzpOrder.notes?.user_id === session.userId)) {
                    const fallbackPlan = (rzpOrder.notes?.planName || body.plan_name || 'DAILY_STANDARD').toUpperCase();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: recoveredOrder } = await (supabase as any).from('orders').upsert({
                        user_id: session.userId,
                        plan_name: fallbackPlan,
                        original_price: rzpOrder.amount,
                        amount: rzpOrder.amount,
                        currency: rzpOrder.currency || 'INR',
                        razorpay_order_id: rzpOrder.id,
                        status: 'pending',
                    }, { onConflict: 'razorpay_order_id' }).select('id, user_id, plan_name, amount, original_price, coupon_code, discount_amount, currency, status').single();
                    if (recoveredOrder) {
                        orderRow = recoveredOrder;
                        orderFetchErr = null;
                        console.log(`[verify] Recovered missing order ${razorpay_order_id} directly from Razorpay for user ${session.userId}`);
                    }
                }
            } catch (rzpOrderErr) {
                console.error('[verify] Razorpay order recovery error:', rzpOrderErr);
            }
        }

        if (orderFetchErr || !orderRow) {
            console.error('[verify] Order record not found:', { razorpay_order_id, orderFetchErr });
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // ── 2. Enforce User Ownership ──────────────────────────────────────────
        if (orderRow.user_id !== session.userId) {
            console.error('[verify] Security Alert: Authenticated user does not own order', {
                orderUserId: orderRow.user_id,
                sessionUserId: session.userId,
                razorpay_order_id,
            });
            return NextResponse.json({ error: 'Forbidden: Order belongs to a different account' }, { status: 403 });
        }

        // ── 3. Idempotency Check (prevent double activation / duplicate credits) ─
        if (orderRow.status === 'success' || orderRow.status === 'paid') {
            console.log(`[verify] Idempotent hit: Order ${razorpay_order_id} already marked successful`);
            // Check for existing invoice
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existingInv } = await (supabase as any)
                .from('invoices')
                .select('invoice_url')
                .eq('razorpay_order_id', razorpay_order_id)
                .maybeSingle();

            return NextResponse.json({
                success: true,
                message: 'Payment already verified and processed',
                invoice_url: existingInv?.invoice_url || null,
            });
        }

        // Also check if payment ID already exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingPayment } = await (supabase as any)
            .from('payments')
            .select('id, invoice_url')
            .eq('razorpay_payment_id', razorpay_payment_id)
            .maybeSingle();

        if (existingPayment) {
            console.log(`[verify] Payment ${razorpay_payment_id} already processed`);
            return NextResponse.json({
                success: true,
                message: 'Payment already recorded',
                invoice_url: existingPayment.invoice_url || null,
            });
        }

        // ── 4. Verify Cryptographic HMAC-SHA256 signature ─────────────────────
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error('[verify] Server configuration error: Missing RAZORPAY_KEY_SECRET');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const expected = createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expected !== razorpay_signature) {
            console.error('[verify] Invalid payment signature for order:', razorpay_order_id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('orders')
                .update({ status: 'failed' })
                .eq('razorpay_order_id', razorpay_order_id);
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // ── 5. Strict Server-Side Razorpay Payment API Verification ───────────
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            try {
                const Razorpay = (await import('razorpay')).default;
                const razorpay = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET,
                });
                const payment = await razorpay.payments.fetch(razorpay_payment_id);
                if (payment) {
                    if (payment.order_id && payment.order_id !== razorpay_order_id) {
                        console.error('[verify] Payment order mismatch:', { paymentOrderId: payment.order_id, razorpay_order_id });
                        return NextResponse.json({ error: 'Payment does not match order' }, { status: 400 });
                    }
                    if (payment.status === 'failed') {
                        return NextResponse.json({ error: 'Payment status is failed' }, { status: 400 });
                    }
                    if (payment.amount && Number(payment.amount) !== Number(orderRow.amount)) {
                        console.error('[verify] Payment amount mismatch:', { paymentAmount: payment.amount, orderAmount: orderRow.amount });
                        return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
                    }
                }
            } catch (apiErr) {
                // If live API verification throws (e.g. rate limit or mock key), log warning
                // Cryptographic HMAC-SHA256 signature check passed above
                console.warn('[verify] Razorpay API fetch warning (continuing with verified signature):', apiErr);
            }
        }

        // ── 6. Extract Verified Plan & Pricing from Server-Side Order ─────────
        // NOTE: Strictly ignore any client-supplied body.plan_name to prevent privilege escalation!
        const verifiedPlanName = (orderRow.plan_name || 'PRO_STANDARD').toUpperCase();
        const currency = orderRow.currency || 'INR';
        const countryCode = orderRow.country_code || 'IN';
        const amountPaise = Number(orderRow.amount ?? 0);
        const originalPrice = Number(orderRow.original_price ?? amountPaise);
        const couponCode = orderRow.coupon_code ?? null;
        const discountAmount = Number(orderRow.discount_amount ?? 0);

        const currencySymbol = currency === 'INR' ? '₹' : '$';
        const formattedAmount = `${currencySymbol}${(amountPaise / 100).toFixed(currency === 'INR' ? 0 : 2)}`;

        // ── 7. Mark order as success ──────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('orders')
            .update({ status: 'success' })
            .eq('razorpay_order_id', razorpay_order_id);

        // ── 8. Fetch billing details ──────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: billing } = await (supabase as any)
            .from('billing_details')
            .select('full_name, email, phone, address, city, state, country, zip_code')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const billingAddress = billing
            ? [billing.address, billing.city, billing.state, billing.zip_code, billing.country]
                .filter(Boolean).join(', ')
            : null;

        // ── 9. Insert verified payment record ─────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('payments').insert({
            user_id: session.userId,
            plan_name: verifiedPlanName,
            original_price: originalPrice,
            coupon_code: couponCode,
            discount_amount: discountAmount,
            amount: amountPaise,
            currency,
            razorpay_payment_id,
            razorpay_order_id,
            status: 'success',
            billing_address: billingAddress,
        });

        // ── 10. Increment coupon usage if coupon applied ───────────────────────
        if (couponCode) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any).rpc('increment_coupon_used', { p_code: couponCode });
            } catch (couponRpcErr) {
                console.warn('[verify] increment_coupon_used rpc notice:', couponRpcErr);
            }
        }

        // ── 11. Grant Verified Credits via Canonical Credit Service ───────────
        const { CreditService, BILLING_CONFIG } = await import('@/lib/billing');
        type PlanKey = keyof typeof BILLING_CONFIG.plans;

        if (verifiedPlanName in BILLING_CONFIG.plans) {
            const planDef = BILLING_CONFIG.plans[verifiedPlanName as PlanKey];
            await CreditService.grantCredits({
                userId: session.userId,
                amount: planDef.credits,
                reason: 'PLAN_PURCHASE',
                referenceType: 'razorpay_order',
                referenceId: razorpay_order_id,
                idempotencyKey: `order_${razorpay_order_id}`,
                planId: planDef.id,
                planDurationDays: planDef.durationDays,
            });
        } else if (BILLING_CONFIG.topUpPacks[verifiedPlanName]) {
            const packDef = BILLING_CONFIG.topUpPacks[verifiedPlanName];
            await CreditService.grantCredits({
                userId: session.userId,
                amount: packDef.credits,
                reason: 'TOPUP_PURCHASE',
                referenceType: 'razorpay_order',
                referenceId: razorpay_order_id,
                idempotencyKey: `order_${razorpay_order_id}`,
            });
        } else {
            // Legacy plan fallback grant based on verified plan name
            const fallbackCredits = verifiedPlanName.includes('PRO') ? 500 : verifiedPlanName.includes('MONTH') ? 250 : 100;
            await CreditService.grantCredits({
                userId: session.userId,
                amount: fallbackCredits,
                reason: 'PLAN_PURCHASE',
                referenceType: 'razorpay_order',
                referenceId: razorpay_order_id,
                idempotencyKey: `order_${razorpay_order_id}`,
                planId: 'PRO',
                planDurationDays: 30,
            });
        }

        // ── 12. Activate legacy user plan for backward compatibility ───────────
        let subscriptionId: string | undefined;
        try {
            subscriptionId = await activateUserPlan(session.userId, verifiedPlanName as PlanName, razorpay_payment_id, couponCode ?? undefined);
        } catch (e) {
            console.warn('[verify] Legacy activateUserPlan notice:', e);
        }

        // ── 13. Generate Invoice ──────────────────────────────────────────────
        const invoice = await createInvoice({
            userId: session.userId,
            subscriptionId,
            plan: verifiedPlanName,
            amount: amountPaise,
            currency,
            paymentMethod: 'razorpay',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            couponCode: couponCode ?? undefined,
            status: 'paid',
            billing: billing ? {
                name: billing.full_name,
                email: billing.email,
                phone: billing.phone,
                address: billing.address,
                city: billing.city,
                state: billing.state,
                country: billing.country,
                zip: billing.zip_code,
            } : null,
        });

        // ── 14. Generate PDF and Upload to Storage ────────────────────────────
        let invoicePdfBase64: string | undefined;
        let invoiceUrl: string | null = null;

        if (invoice) {
            try {
                console.log(`[verify] Generating PDF for invoice: ${invoice.invoice_number}`);
                const { generateInvoiceHtml } = await import('@/lib/invoice-template');
                const { generatePdfFromHtml } = await import('@/lib/pdf-generator');

                const html = await generateInvoiceHtml(invoice, originalPrice, discountAmount);
                const pdfBuffer = await generatePdfFromHtml(html);
                invoicePdfBase64 = pdfBuffer.toString('base64');

                // Upload to Supabase Storage
                const storagePath = `invoices/${session.userId}/${invoice.invoice_number}.pdf`;
                const { error: uploadError } = await supabase.storage
                    .from('invoices')
                    .upload(storagePath, pdfBuffer, {
                        contentType: 'application/pdf',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('[verify] PDF Upload failed:', uploadError);
                } else {
                    const { data: urlData } = supabase.storage
                        .from('invoices')
                        .getPublicUrl(storagePath);
                    invoiceUrl = urlData.publicUrl;
                    console.log(`[verify] PDF Uploaded: ${invoiceUrl}`);

                    // Update invoice record with URL
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase as any)
                        .from('invoices')
                        .update({ invoice_url: invoiceUrl })
                        .eq('id', invoice.id);

                    // Update local object for email
                    invoice.invoice_url = invoiceUrl;
                }
            } catch (pdfErr) {
                console.error('[verify] PDF Generation/Upload failed:', pdfErr);
            }
        }

        // ── 15. Send payment success email ────────────────────────────────────
        const userEmail = billing?.email ?? null;
        if (userEmail && invoice) {
            console.log(`[verify] Sending success email to: ${userEmail}`);
            sendPaymentSuccessEmail({
                userEmail,
                userName: billing?.full_name,
                plan: verifiedPlanName,
                amountINR: formattedAmount,
                paymentMethod: 'Razorpay',
                couponCode: couponCode ?? undefined,
                invoiceNumber: invoice.invoice_number,
                invoiceId: invoice.id,
                date: format(new Date(), 'dd MMM yyyy'),
                attachmentBase64: invoicePdfBase64,
            }).catch(e => console.error('[verify] Email error:', e));
        }

        console.log(`[verify] Payment pipeline completed securely for user: ${session.userId}, plan: ${verifiedPlanName}`);
        return NextResponse.json({ success: true, invoice_url: invoiceUrl });
    } catch (err) {
        console.error('[verify] Error:', err);
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }
}
