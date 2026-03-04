import { createClient } from '@/lib/supabase/server';

export type PlanName = 'PRO' | 'PREMIUM' | 'CAREER';

interface PlanConfig {
    durationHours: number | null; // null = 30 days
    isMonthly: boolean;
    dailyResumeLimit: number;
    dailyCoverLimit: number;
    dailyMockLimit: number;
    subscriptionPlan: string;
}

const PLAN_CONFIG: Record<PlanName, PlanConfig> = {
    PRO: {
        durationHours: 24,
        isMonthly: false,
        dailyResumeLimit: 9999,
        dailyCoverLimit: 9999,
        dailyMockLimit: 9999,
        subscriptionPlan: 'pro',
    },
    PREMIUM: {
        durationHours: null,
        isMonthly: true,
        dailyResumeLimit: 10,
        dailyCoverLimit: 10,
        dailyMockLimit: 10,
        subscriptionPlan: 'premium',
    },
    CAREER: {
        durationHours: null,
        isMonthly: true,
        dailyResumeLimit: 9999,
        dailyCoverLimit: 9999,
        dailyMockLimit: 9999,
        subscriptionPlan: 'career',
    },
} as const;

/**
 * Activates a paid plan for a user after successful payment.
 * Updates users table with plan details and upserts subscriptions for legacy access checks.
 */
export async function activateUserPlan(userId: string, planName: PlanName): Promise<void> {
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
            plan_start: now.toISOString(),
            plan_end: planEnd.toISOString(),
            plan: 'pro', // legacy field — so existing checkUserAccess still works
            access_expires_at: planEnd.toISOString(), // legacy field
            daily_resume_limit: config.dailyResumeLimit,
            daily_cover_limit: config.dailyCoverLimit,
            daily_mock_limit: config.dailyMockLimit,
        })
        .eq('id', userId);

    if (userError) {
        console.error('[Plan Activation] Failed to update user:', userError);
        throw new Error('Failed to update user plan');
    }

    // Upsert subscription for backward compat with checkUserAccess
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: subError } = await (supabase as any)
        .from('subscriptions')
        .upsert(
            {
                user_id: userId,
                plan: config.subscriptionPlan,
                status: 'active',
                expires_at: planEnd.toISOString(),
            },
            { onConflict: 'user_id' }
        );

    if (subError) {
        // Non-fatal — log but don't throw; user record is already updated
        console.error('[Plan Activation] Failed to upsert subscription:', subError);
    }
}
