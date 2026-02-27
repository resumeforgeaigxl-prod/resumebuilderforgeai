import { createClient } from '@/lib/supabase/server';

export interface AccessResult {
    hasAccess: boolean;
    reason: 'admin' | 'free_override' | 'free_unlimited' | 'subscription' | 'none';
}

/**
 * Server-side check: does this user get watermark-free PDF?
 * Priority: admin > free_unlimited > is_free_override > active subscription
 */
export async function checkUserAccess(userId: string): Promise<AccessResult> {
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user } = await (supabase as any)
        .from('users')
        .select('role, is_free_override, free_unlimited')
        .eq('id', userId)
        .single() as { data: { role: string; is_free_override: boolean; free_unlimited: boolean } | null };

    if (!user) return { hasAccess: false, reason: 'none' };

    if (user.role === 'admin') return { hasAccess: true, reason: 'admin' };
    if (user.free_unlimited) return { hasAccess: true, reason: 'free_unlimited' };
    if (user.is_free_override) return { hasAccess: true, reason: 'free_override' };

    // Check active subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sub } = await (supabase as any)
        .from('subscriptions')
        .select('id, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .limit(1)
        .single() as { data: { id: string; expires_at: string | null } | null };

    if (sub) return { hasAccess: true, reason: 'subscription' };

    return { hasAccess: false, reason: 'none' };
}
