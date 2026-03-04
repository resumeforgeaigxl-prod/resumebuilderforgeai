import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { sendAdminReplyEmail } from '@/lib/brevo';

/**
 * POST /api/admin/support/[id]/reply
 * Admin replies to a support ticket.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (!adminUser || adminUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await req.json();
        const reply: string = (body.reply ?? '').trim();
        const status: string = body.status ?? 'in_progress';

        if (!reply) return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ticket, error } = await (supabase as any)
            .from('support_tickets')
            .update({ admin_reply: reply, status, replied_at: new Date().toISOString() })
            .eq('id', params.id)
            .select('ticket_id, email, status')
            .single();

        if (error || !ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        // Send reply notification email
        sendAdminReplyEmail(ticket.email, ticket.ticket_id, reply, status)
            .catch(e => console.error('[admin/support reply] Email error:', e));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[admin/support reply]', err);
        return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
    }
}
