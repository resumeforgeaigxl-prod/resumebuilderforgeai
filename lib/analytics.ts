import { createClient } from '@/lib/supabase/server';

export interface AnalyticsEvent {
    userId?: string;
    event: string; // 'page_view', 'click', 'feature_use'
    page: string;
    metadata?: Record<string, unknown>;
    ip?: string;
    ua?: string;
}

export async function trackEvent(data: AnalyticsEvent) {
    const supabase = createClient();
    try {
        await supabase.from('user_activity_logs').insert({
            user_id: data.userId || null,
            event_type: data.event,
            page_path: data.page,
            metadata: data.metadata || ({} as Record<string, unknown>),
            ip_address: data.ip || null,
            user_agent: data.ua || null,
            created_at: new Date().toISOString()
        });
        return true;
    } catch (err) {
        console.error('[Analytics] Failed to track event:', err);
        return false;
    }
}

export async function trackAISession(userId: string, feature: string, tokens: number, model: string) {
    const supabase = createClient();
    try {
        await supabase.from('ai_usage_logs').insert({
            user_id: userId,
            feature: feature,
            tokens: tokens,
            model: model,
            created_at: new Date().toISOString()
        });
        return true;
    } catch (err) {
        console.error('[Analytics] Failed to track AI usage:', err);
        return false;
    }
}
