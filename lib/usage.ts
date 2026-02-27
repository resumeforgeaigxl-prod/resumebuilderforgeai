import { createClient } from '@/lib/supabase/server';
import { checkUserAccess } from '@/lib/access';

// Usage Limits configuration
export const USAGE_LIMITS = {
    FREE: {
        RESUME_GENERATIONS: 2,
        AI_BULLET_ENHANCE: 3,
        PORTFOLIO_GENERATION: 1, // Let's say 1 per day for free users
    },
    PRO: {
        RESUME_GENERATIONS: 9999, // practically unlimited
        AI_BULLET_ENHANCE: 9999,
        PORTFOLIO_GENERATION: 9999,
    },
} as const;

export type UsageAction = 'generate_resume' | 'ai_enhance' | 'generate_portfolio';

/**
 * Logs an action to the `usage_logs` table.
 */
export async function logUsage(userId: string, action: UsageAction, ipAddress?: string): Promise<boolean> {
    const supabase = createClient();
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('usage_logs')
            .insert({
                user_id: userId,
                action,
                ip_address: ipAddress || null,
            });

        if (error) {
            console.error('[Usage Tracker] Failed to log usage:', error);
            return false;
        }
        return true;
    } catch (e) {
        console.error('[Usage Tracker] Exception:', e);
        return false;
    }
}

/**
 * Checks if a user has exceeded their daily limit for a specific action.
 * Uses `checkUserAccess` to correctly bucket into FREE or PRO tier limits.
 */
export async function checkDailyLimit(userId: string, action: UsageAction): Promise<{ allowed: boolean; limit: number; used: number; isPro: boolean }> {
    const supabase = createClient();

    // Determine tier via global access utility
    const access = await checkUserAccess(userId);
    const isPro = access.hasAccess;

    const limitKey = action === 'generate_resume' ? 'RESUME_GENERATIONS' :
        action === 'ai_enhance' ? 'AI_BULLET_ENHANCE' :
            'PORTFOLIO_GENERATION';

    const maxAllowed = isPro ? USAGE_LIMITS.PRO[limitKey] : USAGE_LIMITS.FREE[limitKey];

    // Get today's start and end timestamps
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
        // Count existing logs today
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count, error } = await (supabase as any)
            .from('usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action', action)
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString());

        if (error) {
            console.error('[Usage Tracker] Error fetching count:', error);
            // Default deny on DB error to prevent unrestricted flooding
            return { allowed: false, limit: maxAllowed, used: 0, isPro };
        }

        const used = count || 0;
        return {
            allowed: used < maxAllowed,
            limit: maxAllowed,
            used,
            isPro,
        };
    } catch (e) {
        console.error('[Usage Tracker] Exception checking limits:', e);
        return { allowed: false, limit: maxAllowed, used: 0, isPro };
    }
}
