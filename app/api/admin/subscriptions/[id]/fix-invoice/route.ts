import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';
import { createInvoice } from '@/lib/invoice';
import { sendPaymentSuccessEmail } from '@/lib/brevo';

export const dynamic = 'force-dynamic';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();

    const { id: subId } = params;

    try {
        // 1. Fetch Subscription details
        let { data: sub } = await admin
            .from('subscriptions')
            .select('*')
            .eq('id', subId)
            .single();

        // Fallback: search by user_id if ID lookup fails
        if (!sub) {
            const { data: fallback } = await admin
                .from('subscriptions')
                .select('*')
                .eq('user_id', subId)
                .single();
            sub = fallback;
        }

        if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });

        // 2. Fetch User details
        const { data: user, error: userError } = await admin
            .from('users')
            .select('email, full_name')
            .eq('id', sub.user_id)
            .single();

        if (userError || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 3. Check if payment record exists
        const { data: existingPayment } = await admin
            .from('payments')
            .select('id')
            .eq('user_id', sub.user_id)
            .eq('plan_name', sub.plan)
            .eq('status', 'success')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Plan Price Map (Paise)
        const PRICE_MAP: Record<string, number> = {
            'pro': 2900,
            'premium': 19900,
            'career': 49900
        };

        const planKey = sub.plan.toLowerCase();
        const originalPrice = PRICE_MAP[planKey] || 0;

        if (!existingPayment) {
            // Create missing payment record
            const { error: payError } = await supabase
                .from('payments')
                .insert({
                    user_id: sub.user_id,
                    plan_name: sub.plan,
                    amount: 0,
                    original_price: originalPrice,
                    coupon_code: sub.coupon_code,
                    discount_amount: originalPrice,
                    status: 'success'
                })
                .select()
                .single();

            if (payError) throw payError;
        }

        // 4. Resolve billing info
        const { data: billing } = await admin
            .from('billing_details')
            .select('*')
            .eq('user_id', sub.user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // 5. Check if invoice exists
        const { data: existingInvoice } = await admin
            .from('invoices')
            .select('id, invoice_number')
            .eq('user_id', sub.user_id)
            .eq('plan', sub.plan)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        let invoice = existingInvoice;

        if (!existingInvoice) {
            // Create missing invoice
            invoice = await createInvoice({
                userId: sub.user_id,
                plan: sub.plan,
                amount: 0,
                paymentMethod: 'coupon',
                couponCode: sub.coupon_code,
                billing: billing ? {
                    name: billing.full_name,
                    email: user.email,
                    phone: billing.phone,
                    address: billing.address,
                    city: billing.city,
                    state: billing.state,
                    country: billing.country,
                    zip: billing.zip_code
                } : {
                    name: user.full_name || 'User',
                    email: user.email
                }
            });
        }

        if (!invoice) throw new Error('Failed to ensure invoice exists');

        // 5. Resend the "Payment Success" email which includes the invoice information
        await sendPaymentSuccessEmail({
            userEmail: user.email,
            userName: user.full_name || 'User',
            plan: sub.plan,
            amountINR: "0", // amount
            paymentMethod: "Coupon (Free)",
            invoiceNumber: invoice.invoice_number,
            invoiceId: invoice.id,
            couponCode: sub.coupon_code,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        });

        return NextResponse.json({
            success: true,
            message: 'Payment record created, invoice generated, and email sent successfully.',
            invoice_number: invoice.invoice_number
        });

    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
