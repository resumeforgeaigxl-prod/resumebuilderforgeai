-- ==============================================================================
-- ResumeForge Level 14: Browser Agent Reliability, Recovery & Human Takeover Migration
-- Durable Checkpoints, Exactly-Once Submission Guard & Recovery Lifecycle
-- ==============================================================================

-- 1. Extend public.application_runs table with recovery, leasing, and checkpoint columns
ALTER TABLE public.application_runs
    ADD COLUMN IF NOT EXISTS checkpoint_version INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS attempt_count INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS recovery_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS session_reference TEXT,
    ADD COLUMN IF NOT EXISTS browser_session_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS worker_id TEXT,
    ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS form_version TEXT,
    ADD COLUMN IF NOT EXISTS package_version INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS approval_id TEXT,
    ADD COLUMN IF NOT EXISTS telemetry JSONB DEFAULT '{}'::jsonb;

-- Update status CHECK constraint on public.application_runs
ALTER TABLE public.application_runs
    DROP CONSTRAINT IF EXISTS application_runs_status_check;

ALTER TABLE public.application_runs
    ADD CONSTRAINT application_runs_status_check CHECK (status IN (
        'READY',
        'STARTING',
        'INSPECTING',
        'FILLING',
        'VALIDATING',
        'AWAITING_APPROVAL',
        'SUBMITTING',
        'SUBMITTED',
        'PAUSED_NEEDS_USER',
        'RECOVERING',
        'RETRY_SCHEDULED',
        'SESSION_EXPIRED',
        'NEEDS_USER',
        'UNSUPPORTED',
        'FAILED',
        'CANCELLED',
        'SUBMISSION_UNKNOWN',
        'POLICY_BLOCKED'
    ));

-- 2. Create public.application_checkpoints table for durable state persistence
CREATE TABLE IF NOT EXISTS public.application_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.application_runs(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    sequence INT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'FAILED', 'WAITING')),
    safe_result_reference TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_checkpoints_run_seq ON public.application_checkpoints(run_id, sequence);
CREATE INDEX IF NOT EXISTS idx_application_checkpoints_run_status ON public.application_checkpoints(run_id, status);

-- 3. Create public.application_submission_guards table (Exactly-once submit guard)
CREATE TABLE IF NOT EXISTS public.application_submission_guards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL,
    package_version INT NOT NULL DEFAULT 1,
    browser_run_id UUID NOT NULL REFERENCES public.application_runs(id) ON DELETE CASCADE,
    approval_id TEXT NOT NULL,
    form_version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'FAILED', 'UNKNOWN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_submission_guard_attempt UNIQUE (user_id, application_id, package_version, form_version)
);

CREATE INDEX IF NOT EXISTS idx_submission_guards_user_app ON public.application_submission_guards(user_id, application_id);
CREATE INDEX IF NOT EXISTS idx_submission_guards_run_id ON public.application_submission_guards(browser_run_id);

-- 4. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.application_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_submission_guards ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Checkpoints
DROP POLICY IF EXISTS "Users can view own checkpoints" ON public.application_checkpoints;
CREATE POLICY "Users can view own checkpoints"
    ON public.application_checkpoints
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.application_runs r
            WHERE r.id = application_checkpoints.run_id AND r.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own checkpoints" ON public.application_checkpoints;
CREATE POLICY "Users can insert own checkpoints"
    ON public.application_checkpoints
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.application_runs r
            WHERE r.id = application_checkpoints.run_id AND r.user_id = auth.uid()
        )
    );

-- 6. RLS Policies for Submission Guards
DROP POLICY IF EXISTS "Users can view own submission guards" ON public.application_submission_guards;
CREATE POLICY "Users can view own submission guards"
    ON public.application_submission_guards
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own submission guards" ON public.application_submission_guards;
CREATE POLICY "Users can insert own submission guards"
    ON public.application_submission_guards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role bypass
DROP POLICY IF EXISTS "Service role full access on checkpoints" ON public.application_checkpoints;
CREATE POLICY "Service role full access on checkpoints"
    ON public.application_checkpoints
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on submission guards" ON public.application_submission_guards;
CREATE POLICY "Service role full access on submission guards"
    ON public.application_submission_guards
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
