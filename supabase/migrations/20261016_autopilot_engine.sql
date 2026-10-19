-- ==============================================================================
-- ResumeForge — Level 16: Omni Autopilot Policy Engine & Scheduling
-- Persistent Candidate Policy, Scheduled Runs, Review Queue & Audit Trails
-- ==============================================================================

-- 1. Create public.autopilot_policies table
CREATE TABLE IF NOT EXISTS public.autopilot_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    mode TEXT NOT NULL DEFAULT 'OFF' CHECK (mode IN (
        'OFF',
        'DISCOVER',
        'PREPARE',
        'REVIEW_AND_EXECUTE'
    )),
    target_roles TEXT[] NOT NULL DEFAULT '{}',
    preferred_locations TEXT[] NOT NULL DEFAULT '{}',
    remote_preference TEXT NOT NULL DEFAULT 'ANY' CHECK (remote_preference IN (
        'REMOTE',
        'HYBRID',
        'ONSITE',
        'ANY'
    )),
    allowed_employment_types TEXT[] NOT NULL DEFAULT '{"Full-time"}',
    min_salary NUMERIC,
    salary_currency TEXT NOT NULL DEFAULT 'INR',
    experience_min NUMERIC,
    experience_max NUMERIC,
    min_match_score NUMERIC NOT NULL DEFAULT 75,
    excluded_companies TEXT[] NOT NULL DEFAULT '{}',
    daily_preparation_limit INTEGER NOT NULL DEFAULT 5,
    weekly_preparation_limit INTEGER NOT NULL DEFAULT 20,
    daily_submission_limit INTEGER NOT NULL DEFAULT 2,
    weekly_submission_limit INTEGER NOT NULL DEFAULT 10,
    credit_budget_per_day INTEGER NOT NULL DEFAULT 40,
    credit_budget_per_month INTEGER NOT NULL DEFAULT 500,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    preferred_execution_hour INTEGER NOT NULL DEFAULT 9,
    frequency TEXT NOT NULL DEFAULT 'DAILY' CHECK (frequency IN ('DAILY', 'TWICE_DAILY')),
    policy_version INTEGER NOT NULL DEFAULT 1,
    is_paused BOOLEAN NOT NULL DEFAULT false,
    pause_reason TEXT,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for policy lookups and scheduling
CREATE INDEX IF NOT EXISTS idx_autopilot_policies_user ON public.autopilot_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_policies_enabled ON public.autopilot_policies(enabled, is_paused) WHERE enabled = true AND is_paused = false;

-- Enable RLS on autopilot_policies
ALTER TABLE public.autopilot_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own autopilot policy" ON public.autopilot_policies;
CREATE POLICY "Users can view own autopilot policy"
    ON public.autopilot_policies
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own autopilot policy" ON public.autopilot_policies;
CREATE POLICY "Users can insert own autopilot policy"
    ON public.autopilot_policies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own autopilot policy" ON public.autopilot_policies;
CREATE POLICY "Users can update own autopilot policy"
    ON public.autopilot_policies
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 2. Create public.autopilot_runs table (Batch Orchestration Records)
CREATE TABLE IF NOT EXISTS public.autopilot_runs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    policy_version INTEGER NOT NULL DEFAULT 1,
    mode TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'QUEUED',
        'RUNNING',
        'COMPLETED',
        'PARTIAL',
        'FAILED',
        'CANCELLED',
        'PAUSED_BUDGET',
        'PAUSED_USER',
        'PAUSED_SECURITY'
    )),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    jobs_evaluated INTEGER NOT NULL DEFAULT 0,
    jobs_eligible INTEGER NOT NULL DEFAULT 0,
    applications_prepared INTEGER NOT NULL DEFAULT 0,
    applications_submitted INTEGER NOT NULL DEFAULT 0,
    credits_reserved INTEGER NOT NULL DEFAULT 0,
    credits_settled INTEGER NOT NULL DEFAULT 0,
    decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
    error_code TEXT,
    error_message TEXT,
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for autopilot_runs
CREATE INDEX IF NOT EXISTS idx_autopilot_runs_user ON public.autopilot_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_autopilot_runs_status ON public.autopilot_runs(status);

-- Enable RLS on autopilot_runs
ALTER TABLE public.autopilot_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own autopilot runs" ON public.autopilot_runs;
CREATE POLICY "Users can view own autopilot runs"
    ON public.autopilot_runs
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own autopilot runs" ON public.autopilot_runs;
CREATE POLICY "Users can insert own autopilot runs"
    ON public.autopilot_runs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own autopilot runs" ON public.autopilot_runs;
CREATE POLICY "Users can update own autopilot runs"
    ON public.autopilot_runs
    FOR UPDATE
    USING (auth.uid() = user_id);
