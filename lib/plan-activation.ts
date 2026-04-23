import { createClient } from '@/lib/supabase/server';

export type PlanName = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PROFESSIONAL' | 'PRO';

interface PlanConfig {
    durationHours: number | null; // null = 30 days
    isMonthly: boolean;
    dailyTokens: number;
    subscriptionPlan: string;
}

const PLAN_CONFIG: Record<PlanName, PlanConfig> = {
    DAILY: {
        durationHours: 24,
        isMonthly: false,
        dailyTokens: 300,
        subscriptionPlan: 'daily',
    },
    WEEKLY: {
        durationHours: 168, // 7 days
        isMonthly: false,
        dailyTokens: 800,
        subscriptionPlan: 'weekly',
    },
    MONTHLY: {
        durationHours: null,
        isMonthly: true,
        dailyTokens: 2000,
        subscriptionPlan: 'monthly',
    },
    PROFESSIONAL: {
        durationHours: null,
        isMonthly: true,
        dailyTokens: 5000,
        subscriptionPlan: 'professional',
    },
    PRO: {
        durationHours: null,
        isMonthly: true,
        dailyTokens: 5000,
        subscriptionPlan: 'pro',
    },
} as const;

/**
 * Activates a paid plan for a user after successful payment.
 * Updates users table with plan details and upserts subscriptions for legacy access checks.
 */
export async function activateUserPlan(userId: string, planName: PlanName, paymentId?: string): Promise<string | undefined> {
    const supabase = createClient();
    const config = PLAN_CONFIG[planName];

    const now = new Date();
    let planEnd: Date;

    if (config.durationHours !== null) {
        planEnd = new Date(now.getTime() + config.durationHours * 60 * 60 * 1000);
    } else {
        planEnd = new Date(now);
        planEnd.setDate(planEnd.getDate() + 30);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: userError } = await (supabase as any)
        .from('users')
        .update({
            plan_type: planName.toLowerCase(),
            plan_id: planName.toLowerCase(), // Ensure both are in sync
            plan_start: now.toISOString(),
            plan_end: planEnd.toISOString(),
            plan: 'pro', // legacy field — so existing checkUserAccess still works
            access_expires_at: planEnd.toISOString(), // legacy field
            daily_credits_limit: config.dailyTokens,
            tokens_used: 0, // Reset usage on upgrade
            daily_job_views: 0,   // Reset job views
        })
        .eq('id', userId);

    if (userError) {
        console.error('[Plan Activation] Failed to update user:', userError);
        throw new Error('Failed to update user plan');
    }

    // Upsert subscription for backward compat with checkUserAccess
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subData, error: subError } = await (supabase as any)
        .from('subscriptions')
        .upsert(
            {
                user_id: userId,
                plan: config.subscriptionPlan,
                status: 'active',
                expires_at: planEnd.toISOString(),
                payment_id: paymentId ?? null,
            },
            { onConflict: 'user_id' }
        )
        .select()
        .single();

    if (subError) {
        // Non-fatal — log but don't throw; user record is already updated
        console.error('[Plan Activation] Failed to upsert subscription:', subError);
    }

    return subData?.id;
}
