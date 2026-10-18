-- ==============================================================================
-- ResumeForge Level 12: Application Preparation Engine Migration
-- Canonical Application Packages, Snapshots, Truthful Answers & Document Tracking
-- ==============================================================================

-- 1. Create public.application_packages table
CREATE TABLE IF NOT EXISTS public.application_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    job_application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PREPARING', 'NEEDS_USER', 'READY', 'BLOCKED', 'FAILED', 'EXPIRED')),
    version INTEGER NOT NULL DEFAULT 1,
    candidate_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    job_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    resume_version_id TEXT,
    tailored_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    tailoring_status TEXT DEFAULT 'NONE' CHECK (tailoring_status IN ('NONE', 'REUSED', 'TAILORED', 'NOT_NEEDED', 'FAILED')),
    tailoring_evidence JSONB DEFAULT '{}'::jsonb,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    unknown_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    match_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    readiness_score INTEGER NOT NULL DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
    blocked_reason TEXT,
    blocked_evidence TEXT,
    credit_operation JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 2. Extend public.job_applications table with package reference and preparation status
ALTER TABLE public.job_applications
    ADD COLUMN IF NOT EXISTS application_package_id UUID REFERENCES public.application_packages(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS preparation_status TEXT DEFAULT 'DRAFT';

-- 3. Indexes for fast lookups and telemetry
CREATE INDEX IF NOT EXISTS idx_app_packages_user_job ON public.application_packages(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_app_packages_user_status ON public.application_packages(user_id, status);
CREATE INDEX IF NOT EXISTS idx_app_packages_updated_at ON public.application_packages(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_apps_package_id ON public.job_applications(application_package_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.application_packages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Users can view own application packages" ON public.application_packages;
CREATE POLICY "Users can view own application packages"
    ON public.application_packages
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own application packages" ON public.application_packages;
CREATE POLICY "Users can insert own application packages"
    ON public.application_packages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own application packages" ON public.application_packages;
CREATE POLICY "Users can update own application packages"
    ON public.application_packages
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own application packages" ON public.application_packages;
CREATE POLICY "Users can delete own application packages"
    ON public.application_packages
    FOR DELETE
    USING (auth.uid() = user_id);

-- Service role bypass for backend orchestrators
DROP POLICY IF EXISTS "Service role full access on application_packages" ON public.application_packages;
CREATE POLICY "Service role full access on application_packages"
    ON public.application_packages
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
