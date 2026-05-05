export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { activateUserPlan, PlanName } from '@/lib/plan-activation';
import { createInvoice } from '@/lib/invoice';
import { sendPaymentSuccessEmail } from '@/lib/brevo';
import { format } from 'date-fns';

/**
 * POST /api/payment/activate-coupon
 * Called when coupon makes price = 0.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const couponCode: string = (body.coupon_code ?? '').trim().toUpperCase();
        const planName: PlanName = (body.plan_name ?? '').toUpperCase() as PlanName;

        if (!couponCode || !planName) {
            return NextResponse.json({ error: 'Missing coupon_code or plan_name' }, { status: 400 });
        }

        const supabase = createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: coupon } = await (supabase as any)
            .from('coupons')
            .select('id, code, type, value, plan_type, expires_at, max_uses, used_count, is_active')
            .eq('code', couponCode)
            .eq('is_active', true)
            .single() as {
                data: {
                    id: string; type: string; value: number; plan_type: string;
                    expires_at: string | null; max_uses: number | null;
                    used_count: number; is_active: boolean;
                } | null
            };

        if (!coupon) return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 400 });

        // Plan validation
        if (coupon.plan_type !== 'all' && coupon.plan_type !== planName.toLowerCase()) {
            return NextResponse.json({ error: 'This coupon is not valid for this plan' }, { status: 400 });
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
            return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses)
            return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });

        // Detect country and set currency (even if free, for records)
        const countryCode = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'IN';
        const isIndia = countryCode === 'IN';
        const currency = isIndia ? 'INR' : 'USD';

        const CURRENCY_PRICES: Record<string, Record<PlanName, number>> = {
            INR: { DAILY: 29, WEEKLY: 79, MONTHLY: 199, PROFESSIONAL: 499, PRO: 499 },
            USD: { DAILY: 1, WEEKLY: 3, MONTHLY: 6, PROFESSIONAL: 12, PRO: 12 }
        };

        const basePrice = CURRENCY_PRICES[currency][planName] || CURRENCY_PRICES['INR'][planName];
        const isFullAccess = coupon.type === 'full' || coupon.value >= 100;

        if (!isFullAccess)
            return NextResponse.json({ error: 'Coupon does not provide full access' }, { status: 400 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: alreadyUsed } = await (supabase as any)
            .from('subscriptions').select('id')
            .eq('user_id', session.userId).eq('coupon_code', couponCode)
            .limit(1).single() as { data: { id: string } | null };

        if (alreadyUsed)
            return NextResponse.json({ error: 'You have already used this coupon' }, { status: 409 });

        // Increment used_count
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('id', coupon.id);

        // Fetch user for email fallback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: userData } = await (supabase as any)
            .from('users')
            .select('email, full_name')
            .eq('id', session.userId)
            .single();

        // Fetch billing details
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: billing } = await (supabase as any)
            .from('billing_details')
            .select('full_name, email, phone, address, city, state, country, zip_code')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false })
            .limit(1).single();

        const billingAddress = billing
            ? [billing.address, billing.city, billing.state, billing.zip_code, billing.country]
                .filter(Boolean).join(', ')
            : body.billing_address ?? null;

        // Record ₹0 payment with pricing breakdown
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('payments').insert({
            user_id: session.userId,
            plan_name: planName,
            original_price: basePrice * 100,
            coupon_code: couponCode,
            discount_amount: basePrice * 100, // 100% off for activate-coupon path
            amount: 0,
            currency,
            country_code: countryCode,
            payment_gateway: 'coupon',
            razorpay_payment_id: null,
            razorpay_order_id: null,
            status: 'success',
            billing_address: billingAddress,
        });

        // Record subscription
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('subscriptions').upsert({
            user_id: session.userId,
            plan: planName.toLowerCase(),
            status: 'active',
            expires_at: null,
            coupon_code: couponCode,
        }, { onConflict: 'user_id' });

        // Activate plan and get subscription ID
        const subscriptionId = await activateUserPlan(session.userId, planName, undefined, couponCode);

        // Generate ₹0 invoice
        const invoice = await createInvoice({
            userId: session.userId,
            subscriptionId,
            plan: planName,
            amount: 0,
            currency,
            paymentMethod: 'coupon',
            couponCode,
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

        // ── Generate PDF and Upload to Storage ───────────────────────────────
        let invoicePdfBase64: string | undefined;
        let invoiceUrl: string | null = null;
        if (invoice) {
            try {
                console.log(`[activate-coupon] Generating PDF for invoice: ${invoice.invoice_number}`);
                const { generateInvoiceHtml } = await import('@/lib/invoice-template');
                const { generatePdfFromHtml } = await import('@/lib/pdf-generator');

                // For activate-coupon path, discount = original price (100% off)
                const html = await generateInvoiceHtml(invoice, basePrice * 100, basePrice * 100);
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
                    console.error('[activate-coupon] PDF Upload failed:', uploadError);
                } else {
                    const { data: urlData } = supabase.storage
                        .from('invoices')
                        .getPublicUrl(storagePath);
                    invoiceUrl = urlData.publicUrl;
                    console.log(`[activate-coupon] PDF Uploaded: ${invoiceUrl}`);

                    // Update invoice record with URL
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase as any)
                        .from('invoices')
                        .update({ invoice_url: invoiceUrl })
                        .eq('id', invoice.id);

                    invoice.invoice_url = invoiceUrl;
                }
            } catch (pdfErr) {
                console.error('[activate-coupon] PDF Generation/Upload failed:', pdfErr);
            }
        }

        // Send payment/activation email (non-blocking)
        const userEmail = billing?.email ?? userData?.email ?? null;
        if (userEmail && invoice) {
            console.log(`[activate-coupon] Sending success email to: ${userEmail}`);
            sendPaymentSuccessEmail({
                userEmail,
                userName: billing?.full_name ?? userData?.full_name,
                plan: planName,
                amountINR: isIndia ? 'Free' : '$0 (Free)',
                paymentMethod: 'Coupon',
                couponCode,
                invoiceNumber: invoice.invoice_number,
                invoiceId: invoice.id,
                date: format(new Date(), 'dd MMM yyyy'),
                attachmentBase64: invoicePdfBase64,
            }).catch(e => console.error('[activate-coupon] Email error:', e));
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[activate-coupon] Error:', err);
        return NextResponse.json({ error: 'Failed to activate coupon plan' }, { status: 500 });
    }
}



