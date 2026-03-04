import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { sendTicketConfirmationEmail, notifyAdminNewTicket } from '@/lib/brevo';

const CATEGORIES = ['payment_issue', 'resume_error', 'account_issue', 'bug_report', 'other'] as const;

/**
 * POST /api/support — Create a support ticket
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const body = await req.json();

        const name: string = (body.name ?? '').trim();
        const email: string = (body.email ?? '').trim().toLowerCase();
        const category: string = (body.category ?? '').trim();
        const message: string = (body.message ?? '').trim();
        const screenshotUrl: string | null = body.screenshot_url ?? null;

        if (!email || !category || !message) {
            return NextResponse.json({ error: 'Email, category and message are required' }, { status: 400 });
        }
        if (!CATEGORIES.includes(category as typeof CATEGORIES[number])) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        const supabase = createClient();

        // Generate ticket ID — fall back gracefully if RPC not yet deployed
        let ticketId = `TKT-${Date.now()}`;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: ticketIdData, error: rpcErr } = await (supabase as any).rpc('generate_ticket_id') as { data: string | null; error: unknown };
            if (!rpcErr && ticketIdData) ticketId = ticketIdData;
        } catch (rpcEx) {
            console.warn('[support] generate_ticket_id RPC failed, using fallback:', rpcEx);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ticket, error } = await (supabase as any)
            .from('support_tickets')
            .insert({
                ticket_id: ticketId,
                user_id: session?.userId ?? null,
                email,
                name: name || null,
                category,
                message,
                screenshot_url: screenshotUrl,
                status: 'open',
            })
            .select()
            .single();

        if (error) {
            console.error('[support POST] Insert error:', JSON.stringify(error));
            throw error;
        }

        const categoryLabel = category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Emails — non-blocking
        sendTicketConfirmationEmail(email, ticketId, categoryLabel, message)
            .catch(e => console.error('[support] Confirmation email error:', e));
        notifyAdminNewTicket(ticketId, email, categoryLabel, message)
            .catch(e => console.error('[support] Admin notify error:', e));

        return NextResponse.json({ success: true, ticketId, id: ticket.id });
    } catch (err) {
        console.error('[support POST] Error:', err);
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}

/**
 * GET /api/support — List tickets for the logged-in user
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: tickets } = await (supabase as any)
            .from('support_tickets')
            .select('id, ticket_id, category, message, status, admin_reply, created_at, updated_at')
            .eq('user_id', session.userId)
            .order('created_at', { ascending: false });

        return NextResponse.json({ success: true, tickets: tickets ?? [] });
    } catch (err) {
        console.error('[support GET] Error:', err);
        return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 });
    }
}
