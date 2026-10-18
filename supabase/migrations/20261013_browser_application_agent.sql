-- ==============================================================================
-- ResumeForge Level 13: Browser Application Agent V1 Migration
-- Execution Layer Tracking, Approval Mode, ATS Mapping & Submission Evidence
-- ==============================================================================

-- 1. Create public.application_runs table
CREATE TABLE IF NOT EXISTS public.application_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
    application_package_id UUID NOT NULL REFERENCES public.application_packages(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('GREENHOUSE', 'LEVER', 'ASHBY', 'GENERIC_FORM', 'UNSUPPORTED')),
    status TEXT NOT NULL DEFAULT 'READY' CHECK (status IN (
        'READY',
        'STARTING',
        'INSPECTING',
        'FILLING',
        'VALIDATING',
        'AWAITING_APPROVAL',
        'SUBMITTING',
        'SUBMITTED',
        'NEEDS_USER',
        'UNSUPPORTED',
        'FAILED',
        'SUBMISSION_UNKNOWN',
        'SESSION_EXPIRED',
        'POLICY_BLOCKED'
    )),
    current_step TEXT NOT NULL DEFAULT 'READY',
    steps_trace JSONB NOT NULL DEFAULT '[]'::jsonb,
    form_schema JSONB DEFAULT '{}'::jsonb,
    filled_fields JSONB DEFAULT '{}'::jsonb,
    validation_result JSONB DEFAULT '{}'::jsonb,
    requires_user_action BOOLEAN DEFAULT false,
    handoff_reason TEXT,
    handoff_payload JSONB,
    user_approved_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    confirmation_url TEXT,
    confirmation_text TEXT,
    evidence JSONB DEFAULT '{}'::jsonb,
    credit_reservation_id TEXT,
    idempotency_key TEXT UNIQUE,
    error_code TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 2. Indexes for application_runs
CREATE INDEX IF NOT EXISTS idx_application_runs_user_package ON public.application_runs(user_id, application_package_id);
CREATE INDEX IF NOT EXISTS idx_application_runs_status ON public.application_runs(status);
CREATE INDEX IF NOT EXISTS idx_application_runs_job_app ON public.application_runs(job_application_id);
CREATE INDEX IF NOT EXISTS idx_application_runs_idempotency ON public.application_runs(idempotency_key);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.application_runs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can view own application runs" ON public.application_runs;
CREATE POLICY "Users can view own application runs"
    ON public.application_runs
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own application runs" ON public.application_runs;
CREATE POLICY "Users can insert own application runs"
    ON public.application_runs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own application runs" ON public.application_runs;
CREATE POLICY "Users can update own application runs"
    ON public.application_runs
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role bypass
DROP POLICY IF EXISTS "Service role full access on application_runs" ON public.application_runs;
CREATE POLICY "Service role full access on application_runs"
    ON public.application_runs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
