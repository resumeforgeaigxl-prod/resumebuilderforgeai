import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();

    try {
        // ── 1. Fetch all data sources in parallel ───────────────────────────
        const [payRes, subsRes, overrideUsersRes] = await Promise.all([
            admin.from('payments').select('*').eq('status', 'success').order('created_at', { ascending: false }),
            admin.from('subscriptions').select('*').order('created_at', { ascending: false }),
            admin.from('users')
                .select('id, email, is_free_override, free_unlimited, created_at')
                .or('is_free_override.eq.true,free_unlimited.eq.true')
        ]);

        if (payRes.error) throw payRes.error;

        const payments = payRes.data || [];
        const subscriptions = subsRes.data || [];
        const overrideUsers = overrideUsersRes.data || [];

        // ── 2. Collect all unique user IDs for related data ──────────────────
        const allUserIds = new Set<string>();
        payments.forEach(p => allUserIds.add(p.user_id));
        subscriptions.forEach(s => allUserIds.add(s.user_id));
        overrideUsers.forEach(u => allUserIds.add(u.id));

        const userIds = Array.from(allUserIds);

        // ── 3. Fetch missing user emails and billing details ────────────────
        const [usersRes, billingRes] = await Promise.all([
            admin.from('users').select('id, email').in('id', userIds),
            admin.from('billing_details').select('*').in('user_id', userIds).order('created_at', { ascending: false })
        ]);

        // ── 4. Build lookups ─────────────────────────────────────────────────
        const userMap: Record<string, string> = {};
        (usersRes.data || []).forEach(u => { userMap[u.id] = u.email; });
        // Include override users in map too
        overrideUsers.forEach(u => { if (!userMap[u.id]) userMap[u.id] = u.email; });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subMap: Record<string, any> = {};
        subscriptions.forEach(s => { subMap[s.user_id] = s; });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const billingMap: Record<string, any> = {};
        (billingRes.data || []).forEach(b => {
            if (!billingMap[b.user_id]) billingMap[b.user_id] = b;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const overrideMap: Record<string, any> = {};
        overrideUsers.forEach(u => { overrideMap[u.id] = u; });

        // ── 5. Build the rows ────────────────────────────────────────────────
        // We want to show all payments, PLUS any subscription/override that has NO payment record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalRows: any[] = [];
        const usersWithPayment = new Set<string>();

        // A. Process Payments (The actual transactions)
        payments.forEach(p => {
            usersWithPayment.add(p.user_id);
            const sub = subMap[p.user_id];
            const billing = billingMap[p.user_id];

            finalRows.push(formatRow(p, sub, billing, userMap[p.user_id]));
        });

        // B. Process Subscriptions that have NO payment record
        subscriptions.forEach(s => {
            if (!usersWithPayment.has(s.user_id)) {
                usersWithPayment.add(s.user_id);
                const billing = billingMap[s.user_id];
                finalRows.push(formatRow(null, s, billing, userMap[s.user_id], 'subscription_only'));
            }
        });

        // C. Process Overrides that have NO payment AND NO subscription record
        overrideUsers.forEach(u => {
            if (!usersWithPayment.has(u.id)) {
                const billing = billingMap[u.id];
                finalRows.push(formatRow(null, null, billing, u.email, 'admin_override', u));
            }
        });

        // Final sort by created_at desc
        finalRows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json({ success: true, subscriptions: finalRows });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// Helper to unify the different sources into the same row structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatRow(pay: any, sub: any, billing: any, email: string, source_type = 'payment', overrideUser?: any) {
    const userId = pay?.user_id || sub?.user_id || overrideUser?.id;

    let paymentMethod = '—';
    if (pay) {
        paymentMethod = pay.coupon_code
            ? (pay.amount === 0 ? 'coupon_free' : 'coupon_partial')
            : pay.razorpay_payment_id ? 'razorpay' : '—';
    } else if (source_type === 'admin_override') {
        paymentMethod = 'admin_override';
    } else if (sub?.coupon_code) {
        paymentMethod = 'coupon_free';
    }

    const billingAddress = billing
        ? [billing.address, billing.city, billing.state, billing.zip_code, billing.country]
            .filter(Boolean).join(', ')
        : pay?.billing_address ?? null;

    return {
        id: sub?.id || pay?.id || `virtual-${userId}`,
        plan: pay?.plan_name || sub?.plan || (overrideUser?.free_unlimited ? 'unlimited' : 'pro'),
        status: sub?.status || (overrideUser ? 'active' : 'active'),
        expires_at: sub?.expires_at || null,
        created_at: pay?.created_at || sub?.created_at || overrideUser?.created_at || new Date().toISOString(),
        coupon_code: pay?.coupon_code || sub?.coupon_code || null,
        user_id: userId,
        user_email: email || 'Unknown',
        // Pricing
        original_price: pay?.original_price ?? pay?.amount ?? 0,
        discount_amount: pay?.discount_amount ?? 0,
        amount: pay?.amount ?? 0,
        currency: pay?.currency || 'INR',
        // Payment
        payment_method: paymentMethod,
        razorpay_payment_id: pay?.razorpay_payment_id ?? null,
        // Billing
        billing_name: billing?.full_name ?? null,
        billing_phone: billing?.phone ?? null,
        billing_company: billing?.company_name ?? null,
        billing_address: billingAddress,
    };
}
