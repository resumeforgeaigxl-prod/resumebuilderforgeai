import { createClient } from './supabase/server';

export async function unlockBadge(userId: string, badgeName: string) {
    const supabase = createClient();

    // 1. Find badge ID
    const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('badge_name', badgeName)
        .single();

    if (!badge) return;

    // 2. Grant badge (unique constraint will prevent duplicates)
    await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id
    });
}

/**
 * Automatically check and unlock badges based on activity counts
 */
export async function checkAutomatedBadges() {
    // Example logic: Check Learning Champion (10 modules)
    // This requires counting from a table that tracks module completion.
    // For now, these will be called manually from the relevant APIs.
}
