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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_name } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan_name) {
            return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
        }

        // Verify HMAC-SHA256 signature
        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const expected = createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expected !== razorpay_signature) {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('orders')
                .update({ status: 'failed' })
                .eq('razorpay_order_id', razorpay_order_id);
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        const supabase = createClient();

        // Mark order success
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('orders')
            .update({ status: 'success' })
            .eq('razorpay_order_id', razorpay_order_id);

        // Fetch billing details
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: billing } = await (supabase as any)
            .from('billing_details')
            .select('full_name, email, phone, address, city, state, country, zip_code')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        const billingAddress = billing
            ? [billing.address, billing.city, billing.state, billing.zip_code, billing.country]
                .filter(Boolean).join(', ')
            : null;

        // Fetch amount from order
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: order } = await (supabase as any)
            .from('orders')
            .select('amount')
            .eq('razorpay_order_id', razorpay_order_id)
            .single();

        const amountPaise = order?.amount ?? 0;
        const amountINR = `₹${(amountPaise / 100).toFixed(0)}`;

        // Insert payment record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('payments').insert({
            user_id: session.userId,
            plan_name: plan_name.toUpperCase(),
            amount: amountPaise,
            razorpay_payment_id,
            razorpay_order_id,
            status: 'success',
            billing_address: billingAddress,
        });

        // Activate user plan
        await activateUserPlan(session.userId, plan_name.toUpperCase() as PlanName);

        // Generate invoice
        const invoice = await createInvoice({
            userId: session.userId,
            plan: plan_name.toUpperCase(),
            amount: amountPaise,
            paymentMethod: 'razorpay',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
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

        // Send payment success email (non-blocking)
        const userEmail = billing?.email ?? null;
        if (userEmail && invoice) {
            sendPaymentSuccessEmail({
                userEmail,
                userName: billing?.full_name,
                plan: plan_name.toUpperCase(),
                amountINR,
                paymentMethod: 'razorpay',
                invoiceNumber: invoice.invoice_number,
                invoiceId: invoice.id,
                date: format(new Date(), 'dd MMM yyyy'),
            }).catch(e => console.error('[verify] Email error:', e));
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[verify] Error:', err);
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }
}
