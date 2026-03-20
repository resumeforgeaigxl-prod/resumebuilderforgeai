import { createClient } from '@/lib/supabase/server';

const DAILY_RUN_LIMIT = 30;
const RATE_LIMIT_PER_MINUTE = 5;

interface RunCredits {
    user_id: string;
    runs_remaining: number;
    last_reset: string;
    last_run_at: string | null;
    runs_this_minute: number;
    minute_reset_at: string;
}

/**
 * Checks if a user has remaining code execution credits and respects rate limits.
 */
export async function getCodeExecutionCredits(userId: string): Promise<RunCredits> {
    const supabase = createClient();

    // Check if the user has an entry in code_execution_credits
    const { data: creditData, error: fetchError } = await supabase
        .from('code_execution_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (fetchError && fetchError.code === 'PGRST116') { // Record not found
        // Create initial credits for new user
        const now = new Date().toISOString();
        const { data: newUserCredit, error: insertError } = await supabase
            .from('code_execution_credits')
            .insert({ 
                user_id: userId, 
                runs_remaining: DAILY_RUN_LIMIT, 
                last_reset: now,
                runs_this_minute: 0,
                minute_reset_at: now
            })
            .select()
            .single();

        if (insertError) {
            console.error('[CodeCredits] Failed to create record:', insertError);
            throw new Error('Failed to initialize credits');
        }
        return newUserCredit as RunCredits;
    } else if (fetchError) {
        console.error('[CodeCredits] Failed to fetch record:', fetchError);
        throw new Error('Failed to fetch credits');
    }

    const now = new Date();
    const lastReset = new Date(creditData.last_reset);
    const minuteReset = new Date(creditData.minute_reset_at);

    // 1. Check daily reset (24 hours)
    const diffHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
    if (diffHours >= 24) {
        const { data: resetResult, error: resetError } = await supabase
            .from('code_execution_credits')
            .update({ 
                runs_remaining: DAILY_RUN_LIMIT, 
                last_reset: now.toISOString(),
                runs_this_minute: 0,
                minute_reset_at: now.toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (!resetError) return resetResult as RunCredits;
    }

    // 2. Check minute reset (for rate limiting 5/min)
    const diffSeconds = (now.getTime() - minuteReset.getTime()) / 1000;
    if (diffSeconds >= 60) {
        const { data: minuteResetResult, error: minResetError } = await supabase
            .from('code_execution_credits')
            .update({ 
                runs_this_minute: 0,
                minute_reset_at: now.toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (!minResetError) return minuteResetResult as RunCredits;
    }

    return creditData as RunCredits;
}

/**
 * Validates if the user can run code and consumes credit if they can.
 */
export async function consumeCodeExecutionCredit(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    let credits;
    
    try {
        credits = await getCodeExecutionCredits(userId);
    } catch {
        return { success: false, error: 'System error. Try again later.' };
    }

    if (credits.runs_remaining <= 0) {
        return { success: false, error: 'Daily run limit reached (30/day).' };
    }

    if (credits.runs_this_minute >= RATE_LIMIT_PER_MINUTE) {
        return { success: false, error: 'Rate limit exceeded (5/min). Please wait.' };
    }

    // Cooldown check (5 seconds)
    if (credits.last_run_at) {
        const lastRun = new Date(credits.last_run_at);
        const diff = (new Date().getTime() - lastRun.getTime()) / 1000;
        if (diff < 5) {
            return { success: false, error: 'Slow down! Wait 5 seconds between runs.' };
        }
    }

    const { error } = await supabase
        .from('code_execution_credits')
        .update({ 
            runs_remaining: credits.runs_remaining - 1,
            runs_this_minute: (credits.runs_this_minute || 0) + 1,
            last_run_at: new Date().toISOString()
        })
        .eq('user_id', userId);

    if (error) {
        console.error('[CodeCredits] Failed to consume:', error);
        return { success: false, error: 'Failed to update credits.' };
    }

    return { success: true };
}

/**
 * Refunds one credit if the execution failed before completion.
 */
export async function refundCodeExecutionCredit(userId: string): Promise<void> {
    const supabase = createClient();
    try {
        const credits = await getCodeExecutionCredits(userId);
        await supabase
            .from('code_execution_credits')
            .update({ 
                runs_remaining: credits.runs_remaining + 1 
            })
            .eq('user_id', userId);
    } catch (err) {
        console.error('[CodeCredits] Refund failed', err);
    }
}
