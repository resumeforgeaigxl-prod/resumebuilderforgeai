export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();
        
        // 1. Get total users
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // 2. Get active users today (distinct user_id from activity logs)
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const { count: activeToday } = await supabase
            .from('user_activity_logs')
            .select('user_id', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        // 3. Get AI requests today
        const { count: aiToday } = await supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        // 4. Get top results for charts (simulated or simplified for now)
        return NextResponse.json({
            stats: {
                total_users: totalUsers || 0,
                active_users_today: activeToday || 0,
                ai_requests_today: aiToday || 0,
                most_used_feature: 'ResumeForge',
                top_pages: [
                    { path: '/dashboard', visits: 1205 },
                    { path: '/explainforge', visits: 842 },
                    { path: '/resume-builder', visits: 654 },
                    { path: '/jobs', visits: 412 },
                    { path: '/pricing', visits: 231 }
                ]
            }
        });

    } catch (err) {
        console.error('Admin Analytics API error:', err);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}


