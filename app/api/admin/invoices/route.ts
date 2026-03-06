import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/invoices
 * Returns all invoices with user email for admin view.
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const admin = createAdminClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: invoices, error } = await (admin as any)
            .from('invoices')
            .select(`
                id, invoice_number, plan, amount, currency, payment_method, coupon_code,
                razorpay_payment_id, razorpay_order_id,
                billing_name, billing_email, billing_phone,
                billing_address, billing_city, billing_state, billing_country, billing_zip,
                created_at, user_id,
                users ( email )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = (invoices as any[]).map((inv: any) => ({
            ...inv,
            user_email: (Array.isArray(inv.users) ? inv.users[0]?.email : inv.users?.email) || 'Unknown',
            users: undefined,
        }));

        return NextResponse.json({ success: true, invoices: formatted });
    } catch (err) {
        console.error('[GET /api/admin/invoices]', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
