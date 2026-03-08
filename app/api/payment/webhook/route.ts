import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { activateUserPlan, PlanName } from '@/lib/plan-activation';
import { createInvoice } from '@/lib/invoice';
import { sendPaymentSuccessEmail } from '@/lib/brevo';
import { format } from 'date-fns';
import { generateInvoiceHtml } from '@/lib/invoice-template';
import { generatePdfFromHtml } from '@/lib/pdf-generator';

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-razorpay-signature') ?? '';

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
        const expected = createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        if (expected !== signature) {
            console.error('[webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(rawBody);

        if (event.event === 'payment.captured') {
            const payloadPayment = event.payload?.payment?.entity;
            if (!payloadPayment) return NextResponse.json({ ok: true });

            const razorpayOrderId: string = payloadPayment.order_id;
            const razorpayPaymentId: string = payloadPayment.id;
            const currency: string = payloadPayment.currency || 'INR';

            const supabase = createClient();

            // Look up our order to get user_id and plan_name
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: order } = await (supabase as any)
                .from('orders')
                .select('id, user_id, plan_name, status, amount, country_code')
                .eq('razorpay_order_id', razorpayOrderId)
                .single();

            if (!order) return NextResponse.json({ ok: true });

            // Idempotency
            if (order.status === 'success') return NextResponse.json({ ok: true });

            // Mark order success
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('orders')
                .update({ status: 'success' })
                .eq('id', order.id);

            // Check if payment already recorded
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existingPay } = await (supabase as any)
                .from('payments')
                .select('id')
                .eq('razorpay_order_id', razorpayOrderId)
                .limit(1)
                .single();

            if (!existingPay) {
                // Insert payment record
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any).from('payments').insert({
                    user_id: order.user_id,
                    plan_name: order.plan_name,
                    amount: order.amount,
                    currency: currency,
                    country_code: order.country_code,
                    payment_gateway: 'razorpay',
                    razorpay_payment_id: razorpayPaymentId,
                    razorpay_order_id: razorpayOrderId,
                    status: 'success',
                });
            }

            // Activate plan
            await activateUserPlan(order.user_id, order.plan_name as PlanName, razorpayPaymentId);

            // ── GENERATE INVOICE & SEND EMAIL (Fallback for missing verify flow) ──
            try {
                // Fetch billing details
                const { data: billing } = await supabase
                    .from('billing_details')
                    .select('full_name, email, phone, address, city, state, country, zip_code')
                    .eq('user_id', order.user_id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Create invoice record
                const invoice = await createInvoice({
                    userId: order.user_id,
                    plan: order.plan_name.toUpperCase(),
                    amount: order.amount,
                    currency,
                    paymentMethod: 'razorpay',
                    razorpayOrderId: razorpayOrderId,
                    razorpayPaymentId: razorpayPaymentId,
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

                if (invoice) {
                    console.log(`[webhook] Generating PDF for invoice: ${invoice.invoice_number}`);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: user } = await (supabase as any).from('users').select('email, full_name').eq('id', order.user_id).single();
                    const userEmail = billing?.email ?? user?.email;

                    const currencySymbol = currency === 'INR' ? '₹' : '$';
                    const formattedAmount = `${currencySymbol}${(order.amount / 100).toFixed(currency === 'INR' ? 0 : 2)}`;

                    // Generate PDF
                    const originalPrice = order.amount;
                    const html = await generateInvoiceHtml(invoice, originalPrice, 0);
                    const pdfBuffer = await generatePdfFromHtml(html);
                    const invoicePdfBase64 = pdfBuffer.toString('base64');

                    // Upload to Supabase Storage
                    const storagePath = `invoices/${order.user_id}/${invoice.invoice_number}.pdf`;
                    const { error: uploadError } = await supabase.storage
                        .from('invoices')
                        .upload(storagePath, pdfBuffer, {
                            contentType: 'application/pdf',
                            upsert: true
                        });

                    let invoiceUrl = null;
                    if (!uploadError) {
                        const { data: urlData } = supabase.storage
                            .from('invoices')
                            .getPublicUrl(storagePath);
                        invoiceUrl = urlData.publicUrl;

                        // Update invoice record with URL
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (supabase as any)
                            .from('invoices')
                            .update({ invoice_url: invoiceUrl })
                            .eq('id', invoice.id);

                        invoice.invoice_url = invoiceUrl;
                    }

                    if (userEmail) {
                        console.log(`[webhook] Sending success email to: ${userEmail}`);
                        await sendPaymentSuccessEmail({
                            userEmail,
                            userName: billing?.full_name ?? user?.full_name,
                            plan: order.plan_name.toUpperCase(),
                            amountINR: formattedAmount,
                            paymentMethod: 'Razorpay (Webhook)',
                            invoiceNumber: invoice.invoice_number,
                            invoiceId: invoice.id,
                            date: format(new Date(), 'dd MMM yyyy'),
                            attachmentBase64: invoicePdfBase64,
                        });
                    }
                }
            } catch (emailErr) {
                console.error('[webhook] Invoice/Email fallback error:', emailErr);
            }
        }

        if (event.event === 'payment.failed') {
            const payloadPayment = event.payload?.payment?.entity;
            if (payloadPayment?.order_id) {
                const supabase = createClient();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any)
                    .from('orders')
                    .update({ status: 'failed' })
                    .eq('razorpay_order_id', payloadPayment.order_id);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[webhook] Error:', err);
        return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
    }
}
