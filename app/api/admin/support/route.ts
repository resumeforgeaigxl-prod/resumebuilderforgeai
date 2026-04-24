export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

/**
 * GET /api/admin/support — All support tickets
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (!adminUser || adminUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const admin = createAdminClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: tickets, error } = await (admin as any)
            .from('support_tickets')
            .select('id, ticket_id, user_id, email, name, category, message, screenshot_url, status, admin_reply, replied_at, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ success: true, tickets: tickets ?? [] });
    } catch (err) {
        console.error('[admin/support GET]', err);
        return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 });
    }
}

