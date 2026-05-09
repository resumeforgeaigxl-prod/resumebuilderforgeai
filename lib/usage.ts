import { createClient } from '@/lib/supabase/server';
import { checkUserAccess, PlanLevel } from '@/lib/access';

// Usage Limits configuration based on Plan
// Interpretation: 1 Token = 1 AI Credit
export const USAGE_LIMITS: Record<PlanLevel | 'PRO', number> = {
    'FREE': 50,
    'DAILY': 300,
    'WEEKLY': 800,
    'MONTHLY': 2000,
    'PROFESSIONAL': 5000,
    'PRO': 5000, // Legacy support
    'ADMIN': 999999,
};

export type UsageAction = 'generate_resume' | 'ai_enhance' | 'generate_portfolio' | 'explain_project' | 'ai_message';

// Token costs for different actions
const ACTION_COSTS: Record<UsageAction, number> = {
    'generate_resume': 5,
    'ai_enhance': 1,
    'generate_portfolio': 10,
    'explain_project': 2,
    'ai_message': 1, // 2-4 messages per forge roughly translates to this cost
};

/**
 * Logs an action and deducts tokens.
 */
export async function logUsage(userId: string, action: UsageAction, ipAddress?: string): Promise<boolean> {
    const supabase = createClient();
    const cost = ACTION_COSTS[action] || 1;

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).rpc('increment_user_usage', {
            p_user_id: userId,
            p_tokens: cost
        });

        if (error) {
            console.error('[Usage Tracker] Failed to log usage via RPC:', error);
            // Fallback: log to usage_logs at least
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('usage_logs').insert({
                user_id: userId,
                action,
                ip_address: ipAddress || null,
            });
            return false;
        }

        // Also log for history
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('usage_logs').insert({
            user_id: userId,
            action,
            ip_address: ipAddress || null,
            tokens_used: cost
        });

        return true;
    } catch (e) {
        console.error('[Usage Tracker] Exception:', e);
        return false;
    }
}

/**
 * Checks if a user has enough tokens for an action.
 */
export async function checkDailyLimit(userId: string, action: UsageAction): Promise<{ allowed: boolean; limit: number; used: number; plan: PlanLevel }> {
    const supabase = createClient();
    const cost = ACTION_COSTS[action] || 1;

    // Determine tier via global access utility
    const access = await checkUserAccess(userId);
    const plan = access.plan;
    const maxAllowed = USAGE_LIMITS[plan] || 20;

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: user, error } = await (supabase as any)
            .from('users')
            .select('daily_credits_used, last_token_reset')
            .eq('id', userId)
            .single();

        if (error || !user) {
            console.error('[Usage Tracker] Error fetching user usage:', error);
            return { allowed: false, limit: maxAllowed, used: 0, plan };
        }

        // Check if reset is needed (daily)
        const lastReset = user.last_token_reset ? new Date(user.last_token_reset) : new Date(0);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        let used = user.daily_credits_used || 0;

        if (lastReset < todayStart) {
            // Reset tokens
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('users').update({
                daily_credits_used: 0,
                last_token_reset: new Date().toISOString()
            }).eq('id', userId);
            used = 0;
        }

        return {
            allowed: (used + cost) <= maxAllowed,
            limit: maxAllowed,
            used,
            plan,
        };
    } catch (e) {
        console.error('[Usage Tracker] Exception checking limits:', e);
        return { allowed: false, limit: maxAllowed, used: 0, plan };
    }
}
