import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();

        // 1. Verify admin
        const { data: user } = await admin.from('users').select('role').eq('id', session.userId).single();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch Aggregated Data with individual error handling
        const [
            invoicesRes,
            paymentsRes,
            subsRes,
            couponsRes
        ] = await Promise.all([
            admin.from('invoices').select('amount, currency, payment_method, plan, status, payment_id').then(r => r, e => ({ data: [], error: e })),
            admin.from('payments').select('amount, currency, status, payment_id').eq('status', 'success').then(r => r, e => ({ data: [], error: e })),
            admin.from('subscriptions').select('plan, status').then(r => r, e => ({ data: [], error: e })),
            admin.from('coupons').select('code, used_count, max_uses').then(r => r, e => ({ data: [], error: e }))
        ]);

        const invoices = invoicesRes.data || [];
        const payments = paymentsRes.data || [];
        const subs = subsRes.data || [];
        const coupons = couponsRes.data || [];

        const paidInvoices = (invoices || []).filter(i => i.status === 'paid');
        const processedPaymentIds = new Set(paidInvoices.map(i => i.payment_id).filter(Boolean));

        // Legacy payments not in invoices
        const legacyPayments = payments.filter(p => !processedPaymentIds.has(p.payment_id));

        // Revenue calculation
        const revenueINR = [...paidInvoices, ...legacyPayments]
            .filter(i => i.currency === 'INR')
            .reduce((sum, i) => sum + i.amount, 0);

        const revenueUSD = [...paidInvoices, ...legacyPayments]
            .filter(i => i.currency === 'USD')
            .reduce((sum, i) => sum + i.amount, 0);

        const totalPaidCount = paidInvoices.length + legacyPayments.length;

        // Subscription breakdown
        const subStats = (subs || []).reduce((acc, s) => {
            acc[s.plan] = (acc[s.plan] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Coupon summary
        const topCoupons = (coupons || [])
            .sort((a, b) => (b.used_count || 0) - (a.used_count || 0))
            .slice(0, 5);

        const totalCouponUses = (coupons || []).reduce((sum, c) => sum + (c.used_count || 0), 0);

        return NextResponse.json({
            success: true,
            stats: {
                revenue: {
                    inr: revenueINR,
                    usd: revenueUSD,
                    total_paid_count: totalPaidCount
                },
                subscriptions: subStats,
                coupons: {
                    total_uses: totalCouponUses,
                    top: topCoupons
                },
                total_invoices: (invoices || []).length + legacyPayments.length
            }
        });

    } catch (err) {
        console.error('[Admin Analytics] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
