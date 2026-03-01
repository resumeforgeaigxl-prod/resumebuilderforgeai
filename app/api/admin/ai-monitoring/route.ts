import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

async function checkAdmin() {
    const session = await getSession();
    if (!session) return null;
    const supabase = createClient();
    const { data: user } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (user?.role !== 'admin') return null;
    return supabase;
}

export async function GET(request: Request) {
    try {
        const supabase = await checkAdmin();
        if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        const userId = url.searchParams.get('userId');
        const conversationId = url.searchParams.get('conversationId');

        // New Detailed Chat View
        if (action === 'chat-history' && (userId || conversationId)) {
            let query = supabase.from('ai_messages').select('*');
            if (conversationId) {
                query = query.eq('conversation_id', conversationId);
            } else if (userId) {
                // Fetch latest conversation if only userId
                const { data: latestConvo } = await supabase
                    .from('conversations')
                    .select('id')
                    .eq('user_id', userId)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .single();

                if (latestConvo) {
                    query = query.eq('conversation_id', latestConvo.id);
                } else {
                    return NextResponse.json({ chats: [] });
                }
            }

            const { data } = await query.order('created_at', { ascending: true });
            return NextResponse.json({ chats: data || [] });
        }

        // Production Dashboard Stats

        const [
            { data: statsView },
            { data: usageRaw },
            { data: violationsRaw }
        ] = await Promise.all([
            // Use the view for summary stats
            supabase.from('ai_admin_stats_view').select('*').single(),
            // Fetch usage summary by user
            supabase.from('ai_usage_logs')
                .select('user_id, tokens_used, created_at, users(email, display_name)'),
            // Fetch violations summary
            supabase.from('ai_violations').select('user_id, violation_type')
        ]);

        // Process aggregating users (This should ideally be a DB view, but processing in TS for flexibility now)
        const userMap = new Map();

        (usageRaw || []).forEach(u => {
            const userObj = (Array.isArray(u.users) ? u.users[0] : u.users) as { email: string; display_name: string } | null;
            if (!userMap.has(u.user_id)) {
                userMap.set(u.user_id, {
                    user_id: u.user_id,
                    email: userObj?.email || 'N/A',
                    name: userObj?.display_name || 'User',
                    calls: 0,
                    tokens: 0,
                    violations: 0,
                    lastActive: u.created_at
                });
            }
            const record = userMap.get(u.user_id);
            record.calls++;
            record.tokens += u.tokens_used;
            if (new Date(u.created_at) > new Date(record.lastActive)) {
                record.lastActive = u.created_at;
            }
        });

        // Add violations to map
        (violationsRaw || []).forEach(v => {
            if (userMap.has(v.user_id)) {
                userMap.get(v.user_id).violations++;
            }
        });

        const usersList = Array.from(userMap.values()).sort((a, b) => b.calls - a.calls);

        return NextResponse.json({
            stats: {
                totalCallsToday: statsView?.calls_today || 0,
                activeUsersToday: statsView?.active_users_today || 0,
                totalTokensToday: statsView?.tokens_today || 0,
                totalViolations: statsView?.total_violations || 0
            },
            usersList
        });

    } catch (error: unknown) {
        console.error('[Admin AI] GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch monitoring data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await checkAdmin();
        if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();

        if (body.action === 'reset_violations' && body.userId) {
            await supabase.from('ai_violations').delete().eq('user_id', body.userId);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: unknown) {
        console.error('[Admin AI] POST Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
