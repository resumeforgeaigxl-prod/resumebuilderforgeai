export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();

        // 1. Get user streak
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', session.userId)
            .single();

        const currentStreak = streak?.current_streak || 0;

        // 2. Get next reward
        const { data: nextReward } = await supabase
            .from('streak_rewards')
            .select('*')
            .gt('streak_day', currentStreak)
            .order('streak_day', { ascending: true })
            .limit(1)
            .single();

        return NextResponse.json({
            success: true,
            streak: streak || { current_streak: 0, longest_streak: 0 },
            nextReward: nextReward || null
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}


