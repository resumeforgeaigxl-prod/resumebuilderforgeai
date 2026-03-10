import { createClient } from '@/lib/supabase/server';

const DAILY_CREDITS = 5;

/**
 * Checks if a user has remaining ProjectForge credits.
 */
export async function getUserCredits(userId: string): Promise<{ credits: number; lastReset: string }> {
    const supabase = createClient();

    // Check if the user has an entry in user_credits
    const { data: creditData, error: fetchError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (fetchError && fetchError.code === 'PGRST116') { // Record not found
        // Create initial credits for new user
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newUserCredit, error: insertError } = await supabase
            .from('user_credits')
            .insert({ user_id: userId, credits: DAILY_CREDITS, last_reset: new Date().toISOString() })
            .select()
            .single();

        if (insertError) {
            console.error('[Credits] Failed to create record:', insertError);
            return { credits: 0, lastReset: new Date().toISOString() };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = newUserCredit as any;
        return { credits: result.credits, lastReset: result.last_reset };
    } else if (fetchError) {
        console.error('[Credits] Failed to fetch record:', fetchError);
        return { credits: 0, lastReset: new Date().toISOString() };
    }

    // Check if credits need a manual reset (fallback for cron)
    const lastReset = new Date(creditData.last_reset);
    const now = new Date();
    const diffHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 24) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: resetResult, error: resetError } = await supabase
            .from('user_credits')
            .update({ credits: DAILY_CREDITS, last_reset: now.toISOString() })
            .eq('user_id', userId)
            .select()
            .single();

        if (resetError) {
            console.error('[Credits] Failed to reset record:', resetError);
            return { credits: creditData.credits, lastReset: creditData.last_reset };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = resetResult as any;
        return { credits: result.credits, lastReset: result.last_reset };
    }

    return { credits: creditData.credits, lastReset: creditData.last_reset };
}


/**
 * Consumes one ProjectForge credit.
 */
export async function consumeCredit(userId: string): Promise<boolean> {
    const supabase = createClient();
    const { credits } = await getUserCredits(userId);

    if (credits <= 0) {
        return false;
    }

    const { error } = await supabase
        .from('user_credits')
        .update({ credits: credits - 1 })
        .eq('user_id', userId);

    if (error) {
        console.error('[Credits] Failed to consume credit:', error);
        return false;
    }
    return true;
}
