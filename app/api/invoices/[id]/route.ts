export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

/**
 * GET /api/invoices/[id]
 * Returns full details for a single invoice.
 * User can only access their own; admin can access all.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();

        // Check if admin
        const { data: adminUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.userId)
            .single();

        const isAdmin = adminUser?.role === 'admin';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query = (supabase as any)
            .from('invoices')
            .select('*')
            .eq('id', params.id);

        if (!isAdmin) {
            query = query.eq('user_id', session.userId);
        }

        const { data, error } = await query.single();

        if (error || !data) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, invoice: data });
    } catch (err) {
        console.error('[GET /api/invoices/[id]]', err);
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
}
