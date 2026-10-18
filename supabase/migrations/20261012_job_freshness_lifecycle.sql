-- ==============================================================================
-- ResumeForgeAI — Level 8: Job Freshness, Closure Detection & Replacement Migration
-- ==============================================================================
-- 1. Extend public.jobs with freshness lifecycle timestamps, verification state,
--    closure reasons, and expiry metadata.
-- 2. Extend public.job_sources with source-level status and verification evidence.
-- 3. Add performance indexes for bounded batch freshness queries.
-- ==============================================================================

-- 1. Canonical Freshness Columns on public.jobs
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS next_verify_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS verification_attempts INT DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS verification_source TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS closure_reason TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS verification_evidence JSONB DEFAULT '{}'::jsonb;

-- 2. Source-Level Freshness Columns on public.job_sources
ALTER TABLE public.job_sources ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE public.job_sources ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.job_sources ADD COLUMN IF NOT EXISTS closure_reason TEXT;
ALTER TABLE public.job_sources ADD COLUMN IF NOT EXISTS http_status INT;
ALTER TABLE public.job_sources ADD COLUMN IF NOT EXISTS verification_evidence JSONB DEFAULT '{}'::jsonb;

-- 3. High-Efficiency Indexes for Freshness Scheduler and Closure Filtering
CREATE INDEX IF NOT EXISTS idx_jobs_next_verify_at 
    ON public.jobs (next_verify_at) 
    WHERE status != 'CLOSED';

CREATE INDEX IF NOT EXISTS idx_jobs_status_last_verified 
    ON public.jobs (status, last_verified_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_expires_at 
    ON public.jobs (expires_at) 
    WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_active_discovery 
    ON public.jobs (status, created_at DESC) 
    WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_job_sources_job_status 
    ON public.job_sources (job_id, status);

-- 4. Conservative initialization: Set next verification on existing active jobs
UPDATE public.jobs 
SET next_verify_at = NOW() + INTERVAL '12 hours',
    last_verified_at = NOW()
WHERE next_verify_at IS NULL AND status = 'ACTIVE';
