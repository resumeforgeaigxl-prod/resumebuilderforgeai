import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { activateUserPlan, PlanName } from '@/lib/plan-activation';

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

            // Upsert payment record
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('payments').upsert(
                {
                    user_id: order.user_id,
                    plan_name: order.plan_name,
                    amount: order.amount,
                    currency: currency,
                    country_code: order.country_code,
                    payment_gateway: 'razorpay',
                    razorpay_payment_id: razorpayPaymentId,
                    razorpay_order_id: razorpayOrderId,
                    status: 'success',
                },
                { onConflict: 'razorpay_order_id' }
            );

            // Activate plan
            await activateUserPlan(order.user_id, order.plan_name as PlanName);
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
