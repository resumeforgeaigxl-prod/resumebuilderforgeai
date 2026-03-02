import { createClient } from '@/lib/supabase/server';

export interface AccessResult {
    hasAccess: boolean;
    plan: 'free' | 'pro' | 'admin';
    expiresAt: string | null;
    reason: 'admin' | 'free_override' | 'free_unlimited' | 'subscription' | 'none';
}

/**
 * Server-side check: does this user get watermark-free PDF and full access?
 * Priority: admin > free_unlimited > explicit user.plan="pro" > active subscription
 */
export async function checkUserAccess(userId: string): Promise<AccessResult> {
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user } = await (supabase as any)
        .from('users')
        .select('role, is_free_override, free_unlimited, plan, access_expires_at')
        .eq('id', userId)
        .single() as { data: { role: string; is_free_override: boolean; free_unlimited: boolean; plan?: string; access_expires_at?: string | null } | null };

    if (!user) return { hasAccess: false, plan: 'free', expiresAt: null, reason: 'none' };

    // 1. Admin bypass
    if (user.role === 'admin') return { hasAccess: true, plan: 'admin', expiresAt: null, reason: 'admin' };

    // 2. Explicit Pro Plan on user (from coupons or admin override)
    const now = new Date();
    const userPlanActive = user.plan === 'pro' && (!user.access_expires_at || new Date(user.access_expires_at) > now);

    if (userPlanActive) {
        return {
            hasAccess: true,
            plan: 'pro',
            expiresAt: user.access_expires_at || null,
            reason: 'free_override'
        };
    }

    // 3. System Flags
    if (user.free_unlimited) return { hasAccess: true, plan: 'pro', expiresAt: null, reason: 'free_unlimited' };
    if (user.is_free_override) return { hasAccess: true, plan: 'pro', expiresAt: null, reason: 'free_override' };

    // 4. Check active subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sub } = await (supabase as any)
        .from('subscriptions')
        .select('id, expires_at, plan')
        .eq('user_id', userId)
        .eq('status', 'active')
        .or('expires_at.is.null,expires_at.gt.' + now.toISOString())
        .limit(1)
        .single() as { data: { id: string; expires_at: string | null; plan: string } | null };

    if (sub) {
        return {
            hasAccess: true,
            plan: (sub.plan as 'free' | 'pro') || 'pro',
            expiresAt: sub.expires_at,
            reason: 'subscription'
        };
    }

    return { hasAccess: false, plan: 'free', expiresAt: null, reason: 'none' };
}
