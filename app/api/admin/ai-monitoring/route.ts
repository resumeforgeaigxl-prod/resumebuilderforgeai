export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

interface UsageUser {
    email: string | null;
    display_name: string | null;
}

interface UsageRow {
    user_id: string;
    tokens: number | null;
    created_at: string;
    users: UsageUser | UsageUser[] | null;
}

interface AggregatedUserStats {
    user_id: string;
    email: string;
    name: string;
    calls: number;
    tokens: number;
    lastActive: string;
}

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

        // Detailed Chat View
        if (action === 'chat-history' && userId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase as any)
                .from('chat_messages')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });
            
            return NextResponse.json({ chats: data || [] });
        }

        // Live Sessions View
        if (action === 'live-sessions') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase as any)
                .from('chat_sessions')
                .select('*, users(email, display_name)')
                .order('last_active', { ascending: false })
                .limit(50);
            
            return NextResponse.json({ sessions: data || [] });
        }

        // Dashboard Stats & User List
        const [
            { data: statsView },
            { data: usageRaw }
        ] = await Promise.all([
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any).from('ai_admin_stats_view').select('*').single(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any).from('ai_usage_logs')
                .select('user_id, tokens, created_at, users(email, display_name)')
                .order('created_at', { ascending: false })
        ]);

        // Aggregate users
        const userMap = new Map<string, AggregatedUserStats>();
        (usageRaw || []).forEach((u: UsageRow) => {
            const userObj = (Array.isArray(u.users) ? u.users[0] : u.users) as { email: string; display_name: string } | null;
            if (!userMap.has(u.user_id)) {
                userMap.set(u.user_id, {
                    user_id: u.user_id,
                    email: userObj?.email || 'N/A',
                    name: userObj?.display_name || 'User',
                    calls: 0,
                    tokens: 0,
                    lastActive: u.created_at
                });
            }
            const record = userMap.get(u.user_id);
            if (!record) {
                return;
            }
            record.calls++;
            record.tokens += (u.tokens || 0);
            if (new Date(u.created_at) > new Date(record.lastActive)) {
                record.lastActive = u.created_at;
            }
        });

        const usersList = Array.from(userMap.values()).sort((a, b) => b.calls - a.calls);

        return NextResponse.json({
            stats: {
                totalCallsToday: statsView?.calls_today || 0,
                activeUsersToday: statsView?.active_users_today || 0,
                totalTokensToday: statsView?.tokens_today || 0,
                newSessionsToday: statsView?.new_sessions_today || 0
            },
            usersList
        });

    } catch (error: unknown) {
        console.error('[Admin AI] GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch monitoring data' }, { status: 500 });
    }
}


