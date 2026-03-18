-- ResumeForgeAI User Intelligence & Onboarding Migration
-- Author: Forge Neural Engine

-- 1. EXTEND USERS TABLE
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'Beginner';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- 2. CREATE USER ACTIVITY LOGS (For behavioral tracking)
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'page_view', 'click', 'feature_use', 'onboarding_complete'
    page_path TEXT,
    metadata JSONB DEFAULT '{}'::jsonB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. CREATE SESSION TRACKING
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    logout_time TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    device_info JSONB DEFAULT '{}'::jsonB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. ENABLE RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 5. ADMIN VIEW FOR ANALYTICS
CREATE OR REPLACE VIEW public.admin_user_analytics_view AS
SELECT 
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(DISTINCT user_id) FROM public.user_activity_logs WHERE created_at >= CURRENT_DATE) as active_users_today,
    (SELECT COUNT(*) FROM public.ai_usage_logs WHERE created_at >= CURRENT_DATE) as ai_requests_today,
    f.feature as most_used_feature,
    f.count as feature_usage_count
FROM (
    SELECT feature, COUNT(*) as count 
    FROM public.ai_usage_logs 
    GROUP BY feature 
    ORDER BY count DESC 
    LIMIT 1
) f;

-- 6. POLICIES (Allow service role)
CREATE POLICY "Service role full access logs" ON public.user_activity_logs USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access sessions" ON public.user_sessions USING (true) WITH CHECK (true);
