import { createClient } from '@/lib/supabase/server';
import { PLANS, CREDIT_COSTS, PlanID } from './config';
import { AITask } from '../ai/types';

export class PricingService {
    /**
     * Gets the full access context for a user, including plan features and current credit balance.
     */
    static async getUserAccess(userId: string) {
        const supabase = createClient();
        
        const { data: user, error } = await supabase
            .from('users')
            .select('role, plan_id, daily_credits_used, last_credits_reset, daily_job_views, last_job_reset')
            .eq('id', userId)
            .single();

        if (error || !user) {
            console.error('[PricingService] Error fetching user:', error);
            return { plan: PLANS.free, creditsUsed: 0, creditsRemaining: 0, jobViews: 0 };
        }

        const isAdmin = user.role === 'admin';
        const planId = (isAdmin ? 'pro' : (user.plan_id || 'free')) as PlanID;
        const plan = PLANS[planId] || PLANS.free;


        // Reset credits if it's a new day
        const today = new Date().toISOString().split('T')[0];
        let creditsUsed = user.daily_credits_used || 0;
        let jobViews = user.daily_job_views || 0;

        if (user.last_credits_reset !== today) {
            creditsUsed = 0;
            // Async reset in background for next time
            supabase.from('users').update({ 
                daily_credits_used: 0, 
                last_credits_reset: today 
            }).eq('id', userId).then();
        }

        if (user.last_job_reset !== today) {
            jobViews = 0;
            supabase.from('users').update({ 
                daily_job_views: 0, 
                last_job_reset: today 
            }).eq('id', userId).then();
        }

        return {
            plan,
            creditsUsed,
            creditsRemaining: isAdmin ? 99999 : Math.max(0, plan.creditsPerDay - creditsUsed),
            jobViews,
            jobViewsRemaining: isAdmin ? 99999 : (plan.features.jobLimit ? Math.max(0, plan.features.jobLimit - jobViews) : 9999)
        };

    }

    static async canPerformTask(userId: string, task: AITask): Promise<{ allowed: boolean; reason?: string }> {
        const access = await this.getUserAccess(userId);
        const forgeAccess = access.plan.features.forges[task];

        if (forgeAccess === 'locked') {
            return { allowed: false, reason: 'Upgrade to unlock this forge.' };
        }

        const cost = CREDIT_COSTS[task] || 0;
        if (access.creditsRemaining < cost) {
            return { allowed: false, reason: 'Daily AI credit limit reached.' };
        }

        return { allowed: true };
    }

    static async trackUsage(userId: string, task: AITask) {
        const cost = CREDIT_COSTS[task] || 0;
        if (cost === 0) return;

        const supabase = createClient();
        
        // Atomically increment credits used
        // Note: Using rpc or manual increment
        const { error } = await supabase.rpc('increment_credits', { 
            user_id: userId, 
            amount: cost 
        });

        if (error) {
            // Fallback to manual update if rpc doesn't exist yet
            const { data: user } = await supabase.from('users').select('daily_credits_used').eq('id', userId).single();
            await supabase.from('users').update({ 
                daily_credits_used: (user?.daily_credits_used || 0) + cost 
            }).eq('id', userId);
        }

        // Log transaction
        await supabase.from('credit_transactions').insert({
            user_id: userId,
            amount: cost,
            task: task
        });
    }

    static async trackJobView(userId: string) {
        const supabase = createClient();
        const access = await this.getUserAccess(userId);

        if (access.plan.id === 'free' && (access.jobViewsRemaining || 0) <= 0) {
            return { allowed: false, reason: 'Daily job view limit reached.' };
        }

        await supabase.rpc('increment_job_views', { user_id: userId });
        return { allowed: true };
    }
}
