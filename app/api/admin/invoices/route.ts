export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

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
                *,
                user:user_id ( email, full_name )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = (invoices as any[]).map((inv: any) => ({
            ...inv,
            user_email: inv.user?.email || inv.billing_email || 'Unknown',
            user_full_name: inv.user?.full_name || inv.billing_name || 'Unknown',
            user: undefined,
        }));

        return NextResponse.json({ success: true, invoices: formatted });
    } catch (err) {
        console.error('[GET /api/admin/invoices]', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

