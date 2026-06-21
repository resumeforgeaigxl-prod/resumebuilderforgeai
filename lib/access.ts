import { createClient } from '@/lib/supabase/server';

export type PlanLevel = 'FREE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PROFESSIONAL' | 'ADMIN' | 'PRO';

export interface AccessResult {
    hasAccess: boolean;
    plan: PlanLevel;
    expiresAt: string | null;
    reason: 'admin' | 'free_override' | 'subscription' | 'none';
}

/**
 * Server-side check: does this user get watermark-free PDF and full access?
 * Priority: admin > active subscription > free_override
 */
export async function checkUserAccess(userId: string): Promise<AccessResult> {
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user } = await (supabase as any)
        .from('users')
        .select('role, is_free_override, plan, plan_type, access_expires_at')
        .eq('id', userId)
        .single() as { data: { role: string; is_free_override: boolean; plan?: string; plan_type?: string; access_expires_at?: string | null } | null };

    if (!user) return { hasAccess: false, plan: 'FREE', expiresAt: null, reason: 'none' };

    // 1. Admin bypass
    if (user.role === 'admin') return { hasAccess: true, plan: 'ADMIN', expiresAt: null, reason: 'admin' };

    const now = new Date();

    // 2. Check active subscription (Primary Source of truth for paid plans)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sub } = await (supabase as any)
        .from('subscriptions')
        .select('id, expires_at, plan')
        .eq('user_id', userId)
        .eq('status', 'active')
        .or('expires_at.is.null,expires_at.gt.' + now.toISOString())
        .limit(1)
        .maybeSingle() as { data: { id: string; expires_at: string | null; plan: string } | null };

    if (sub) {
        const rawPlan = sub.plan.toUpperCase();
        const normalized = rawPlan
            .replace('_STANDARD', '')
            .replace('_ALL_ACCESS', '')
            .replace('PRO_STANDARD', 'PROFESSIONAL')
            .replace('PRO_ALL_ACCESS', 'PROFESSIONAL');
        const planName = (normalized === 'PRO' ? 'PROFESSIONAL' : normalized) as PlanLevel;
        return {
            hasAccess: true,
            plan: planName,
            expiresAt: sub.expires_at,
            reason: 'subscription'
        };
    }

    // 3. Fallback to user table fields (for legacy or specific overrides)
    const userPlanRaw = (user.plan_type || user.plan || 'FREE').toUpperCase();
    const normalizedRaw = userPlanRaw
        .replace('_STANDARD', '')
        .replace('_ALL_ACCESS', '')
        .replace('PRO_STANDARD', 'PROFESSIONAL')
        .replace('PRO_ALL_ACCESS', 'PROFESSIONAL');
    const userPlanNormalized = (normalizedRaw === 'PRO' ? 'PROFESSIONAL' : normalizedRaw) as PlanLevel;
    const isPaidPlan = ['DAILY', 'WEEKLY', 'MONTHLY', 'PROFESSIONAL', 'PRO'].includes(userPlanNormalized);
    const isExpired = user.access_expires_at && new Date(user.access_expires_at) < now;

    if (isPaidPlan && !isExpired) {
        return {
            hasAccess: true,
            plan: userPlanNormalized === 'PRO' ? 'PROFESSIONAL' : userPlanNormalized,
            expiresAt: user.access_expires_at || null,
            reason: 'free_override'
        };
    }

    if (user.is_free_override) {
        return {
            hasAccess: true,
            plan: 'PROFESSIONAL',
            expiresAt: null,
            reason: 'free_override'
        };
    }

    return { hasAccess: false, plan: 'FREE', expiresAt: null, reason: 'none' };
}
