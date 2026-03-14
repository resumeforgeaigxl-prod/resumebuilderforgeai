import { createClient } from './supabase/server';

export async function recordUserActivity(userId: string) {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 1. Get current streak info
    const { data: streak, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (streakError && streakError.code !== 'PGRST116') {
        console.error('[StreakService] Error fetching streak:', streakError);
        return;
    }

    if (!streak) {
        // Create new streak record
        await supabase.from('user_streaks').insert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_active_date: today
        });
        await checkAndGrantStreakRewards(userId, 1);
        return;
    }

    if (streak.last_active_date === today) {
        // Already recorded today
        return;
    }

    let newStreak = 1;
    if (streak.last_active_date === yesterdayStr) {
        newStreak = (streak.current_streak || 0) + 1;
    }

    const newLongest = Math.max(newStreak, streak.longest_streak || 0);

    await supabase
        .from('user_streaks')
        .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_active_date: today,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

    await checkAndGrantStreakRewards(userId, newStreak);
}

async function checkAndGrantStreakRewards(userId: string, currentStreak: number) {
    const supabase = createClient();

    // Find if there's a reward for this day
    const { data: reward } = await supabase
        .from('streak_rewards')
        .select('*')
        .eq('streak_day', currentStreak)
        .single();

    if (reward) {
        // Check if user already got this reward today (to prevent double counting if multiple actions)
        // But the check above (last_active_date === today) already prevents this.
        
        await supabase.from('user_rewards').insert({
            user_id: userId,
            reward_type: reward.reward_type,
            reward_value: reward.reward_value,
            expiry_date: reward.reward_type === 'feature_unlock' ? 
                new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
        });
    }
}
