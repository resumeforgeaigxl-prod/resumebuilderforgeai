export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

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
        const [invRes, payRes, subsRes, overrideUsersRes] = await Promise.all([
            admin.from('invoices').select('*').order('created_at', { ascending: false }),
            admin.from('payments').select('*').eq('status', 'success').order('created_at', { ascending: false }),
            admin.from('subscriptions').select('*').order('created_at', { ascending: false }),
            admin.from('users')
                .select('id, email, is_free_override, free_unlimited, created_at')
                .or('is_free_override.eq.true,free_unlimited.eq.true')
        ]);

        if (invRes.error) throw invRes.error;

        const invoices = invRes.data || [];
        const payments = payRes.data || [];
        const subscriptions = subsRes.data || [];
        const overrideUsers = overrideUsersRes.data || [];

        // ── 2. Collect all unique user IDs for related data ──────────────────
        const allUserIds = new Set<string>();
        invoices.forEach(i => allUserIds.add(i.user_id));
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

        // ── 5. Build the rows ────────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalRows: any[] = [];
        const usersProcessed = new Set<string>();

        // A. Process Invoices (The new primary source)
        invoices.forEach(inv => {
            usersProcessed.add(`${inv.user_id}-${inv.payment_id || inv.id}`);
            const sub = subMap[inv.user_id];
            const billing = billingMap[inv.user_id];
            finalRows.push(formatRow(inv, null, sub, billing, userMap[inv.user_id]));
        });

        // B. Process Legacy Payments (If not already handled by an invoice)
        payments.forEach(pay => {
            const key = `${pay.user_id}-${pay.payment_id || pay.id}`;
            if (!usersProcessed.has(key)) {
                usersProcessed.add(key);
                const sub = subMap[pay.user_id];
                const billing = billingMap[pay.user_id];
                finalRows.push(formatRow(null, pay, sub, billing, userMap[pay.user_id]));
            }
        });

        // C. Process Subscriptions that have NO invoice/payment record
        subscriptions.forEach(s => {
            const hasRecord = invoices.some(i => i.user_id === s.user_id) || payments.some(p => p.user_id === s.user_id);
            if (!hasRecord) {
                const billing = billingMap[s.user_id];
                finalRows.push(formatRow(null, null, s, billing, userMap[s.user_id], 'subscription_only'));
            }
        });

        // D. Process Overrides that have NO invoice AND NO subscription record
        overrideUsers.forEach(u => {
            const hasRecord = invoices.some(i => i.user_id === u.id) || payments.some(p => p.user_id === u.id) || subscriptions.some(s => s.user_id === u.id);
            if (!hasRecord) {
                const billing = billingMap[u.id];
                finalRows.push(formatRow(null, null, null, billing, u.email, 'admin_override', u));
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
function formatRow(inv: any, pay: any, sub: any, billing: any, email: string, source_type = 'invoice', overrideUser?: any) {
    const userId = inv?.user_id || pay?.user_id || sub?.user_id || overrideUser?.id;

    let paymentMethod = '—';
    if (inv) {
        paymentMethod = inv.payment_method || (inv.razorpay_payment_id ? 'razorpay' : '—');
    } else if (pay) {
        paymentMethod = pay.payment_method || (pay.razorpay_payment_id ? 'razorpay' : '—');
        if (pay.coupon_code) paymentMethod = pay.amount === 0 ? 'coupon_free' : 'coupon_partial';
    } else if (source_type === 'admin_override') {
        paymentMethod = 'admin_override';
    } else if (sub?.coupon_code) {
        paymentMethod = 'coupon_free';
    }

    const billingAddress = billing
        ? [billing.address, billing.city, billing.state, billing.zip_code, billing.country]
            .filter(Boolean).join(', ')
        : (inv?.billing_address || pay?.billing_address || null);

    return {
        id: inv?.id || pay?.id || sub?.id || `virtual-${userId}`,
        plan: inv?.plan || pay?.plan_name || sub?.plan || (overrideUser?.free_unlimited ? 'unlimited' : 'pro'),
        status: sub?.status || (overrideUser ? 'active' : 'active'),
        expires_at: sub?.expires_at || null,
        created_at: inv?.created_at || pay?.created_at || sub?.created_at || overrideUser?.created_at || new Date().toISOString(),
        coupon_code: inv?.coupon_code || pay?.coupon_code || sub?.coupon_code || null,
        user_id: userId,
        user_email: email || 'Unknown',
        // Pricing
        original_price: inv?.amount ?? pay?.original_price ?? pay?.amount ?? 0,
        discount_amount: pay?.discount_amount ?? 0,
        amount: inv?.amount ?? pay?.amount ?? 0,
        currency: inv?.currency || pay?.currency || 'INR',
        // Payment
        payment_method: paymentMethod,
        razorpay_payment_id: inv?.razorpay_payment_id || pay?.razorpay_payment_id || inv?.payment_id || pay?.payment_id || null,
        // Billing
        billing_name: billing?.full_name || inv?.billing_name || null,
        billing_phone: billing?.phone || inv?.billing_phone || null,
        billing_company: billing?.company_name || null,
        billing_address: billingAddress,
        invoice_number: inv?.invoice_number || null,
    };
}

