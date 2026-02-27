-- ============================================================
-- ResumeForge AI — Phase 2 Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Resume Health Analysis
CREATE TABLE IF NOT EXISTS public.resume_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    resume_id uuid REFERENCES public.resumes (id) ON DELETE CASCADE NOT NULL,
    keyword_score INT DEFAULT 0,
    impact_score INT DEFAULT 0,
    action_score INT DEFAULT 0,
    readability_score INT DEFAULT 0,
    recruiter_scan_time INT DEFAULT 0, -- represented in seconds
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_resume_analysis_resume_id ON public.resume_analysis (resume_id);

-- 2. JD Comparison Engine
CREATE TABLE IF NOT EXISTS public.jd_analysis (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id         uuid REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    jd_text           TEXT NOT NULL,
    match_percentage  INT DEFAULT 0,
    missing_keywords  JSONB DEFAULT '[]'::jsonb,
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- 3. Resume Version History
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    resume_id uuid REFERENCES public.resumes (id) ON DELETE CASCADE NOT NULL,
    version_number INT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Unique constraint to prevent duplicate versions per resume
CREATE UNIQUE INDEX IF NOT EXISTS idx_version_resume_number ON public.resume_versions (resume_id, version_number);

-- 4. Anti-Misuse: Usage Logs
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL, -- 'generate_resume', 'ai_enhance', 'generate_portfolio'
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON public.usage_logs (user_id, created_at);

-- 5. Portfolio Analytics
CREATE TABLE IF NOT EXISTS public.portfolio_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    portfolio_id uuid REFERENCES public.portfolios (id) ON DELETE CASCADE NOT NULL,
    views INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON public.portfolio_analytics (portfolio_id);

-- RLS Enforcement
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.jd_analysis ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Service role full access resume_analysis') THEN
        CREATE POLICY "Service role full access resume_analysis" ON public.resume_analysis USING (true) WITH CHECK (true);
        CREATE POLICY "Service role full access jd_analysis" ON public.jd_analysis USING (true) WITH CHECK (true);
        CREATE POLICY "Service role full access resume_versions" ON public.resume_versions USING (true) WITH CHECK (true);
        CREATE POLICY "Service role full access usage_logs" ON public.usage_logs USING (true) WITH CHECK (true);
        CREATE POLICY "Service role full access portfolio_analytics" ON public.portfolio_analytics USING (true) WITH CHECK (true);
    END IF;
END $$;