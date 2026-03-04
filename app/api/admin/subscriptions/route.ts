import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Fetch subscriptions with user email
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: subscriptions, error } = await (supabase as any)
            .from('subscriptions')
            .select(`
                id, plan, status, expires_at, created_at, coupon_code, user_id,
                users ( email )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch payment records for all user_ids to enrich with amount / method / billing
        const userIds: string[] = Array.from(new Set(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (subscriptions as any[]).map((s: any) => s.user_id).filter(Boolean)
        ));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: payments } = await (supabase as any)
            .from('payments')
            .select('user_id, plan_name, amount, razorpay_payment_id, status, billing_address, created_at')
            .in('user_id', userIds)
            .eq('status', 'success')
            .order('created_at', { ascending: false });

        // Build a quick lookup: user_id → latest payment
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paymentMap: Record<string, any> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payments as any[] ?? []).forEach((p: any) => {
            if (!paymentMap[p.user_id]) paymentMap[p.user_id] = p;
        });

        // Fetch billing details for address info (latest per user)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: billings } = await (supabase as any)
            .from('billing_details')
            .select('user_id, full_name, phone, country, state, city, zip_code, address, company_name, created_at')
            .in('user_id', userIds)
            .order('created_at', { ascending: false });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const billingMap: Record<string, any> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (billings as any[] ?? []).forEach((b: any) => {
            if (!billingMap[b.user_id]) billingMap[b.user_id] = b;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = (subscriptions as any[]).map((s: any) => {
            const payment = paymentMap[s.user_id] ?? null;
            const billing = billingMap[s.user_id] ?? null;

            const paymentMethod = s.coupon_code
                ? 'coupon'
                : payment?.razorpay_payment_id
                    ? 'razorpay'
                    : '—';

            const billingAddress = billing
                ? [billing.address, billing.city, billing.state, billing.zip_code, billing.country]
                    .filter(Boolean).join(', ')
                : payment?.billing_address ?? null;

            return {
                id: s.id,
                plan: s.plan,
                status: s.status,
                expires_at: s.expires_at,
                created_at: s.created_at,
                coupon_code: s.coupon_code,
                user_id: s.user_id,
                user_email: (Array.isArray(s.users) ? s.users[0]?.email : s.users?.email) || 'Unknown',
                // payment fields
                amount: payment?.amount ?? 0,
                payment_method: paymentMethod,
                razorpay_payment_id: payment?.razorpay_payment_id ?? null,
                // billing
                billing_name: billing?.full_name ?? null,
                billing_phone: billing?.phone ?? null,
                billing_company: billing?.company_name ?? null,
                billing_address: billingAddress,
            };
        });

        return NextResponse.json({ success: true, subscriptions: formatted });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
