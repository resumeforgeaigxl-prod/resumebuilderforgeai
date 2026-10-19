-- ==============================================================================
-- ResumeForge — Level 15: Application Execution, Evidence & Status Tracking
-- Canonical Application Model, Immutable History, Provenance & Evidence Records
-- ==============================================================================

-- 1. Extend public.job_applications with canonical tracking columns
ALTER TABLE public.job_applications
    ADD COLUMN IF NOT EXISTS submission_method TEXT DEFAULT 'MANUAL',
    ADD COLUMN IF NOT EXISTS resume_version_id TEXT,
    ADD COLUMN IF NOT EXISTS submission_evidence_id UUID,
    ADD COLUMN IF NOT EXISTS submission_receipt JSONB,
    ADD COLUMN IF NOT EXISTS job_snapshot JSONB,
    ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status check constraint if present, or add index on status
CREATE INDEX IF NOT EXISTS idx_job_applications_user_status ON public.job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_activity ON public.job_applications(user_id, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_job ON public.job_applications(user_id, job_id);

-- 2. Create public.application_evidence table
CREATE TABLE IF NOT EXISTS public.application_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    browser_run_id TEXT REFERENCES public.application_runs(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN (
        'SUBMISSION_CONFIRMATION',
        'PROVIDER_RECEIPT',
        'SCREENSHOT',
        'DOCUMENT_REFERENCE',
        'STATUS_UPDATE',
        'USER_ATTESTATION'
    )),
    source TEXT NOT NULL,
    storage_reference TEXT,
    external_reference TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN (
        'VERIFIED',
        'UNVERIFIED',
        'USER_REPORTED'
    )),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key linking job_applications.submission_evidence_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_job_applications_submission_evidence'
    ) THEN
        ALTER TABLE public.job_applications
            ADD CONSTRAINT fk_job_applications_submission_evidence
            FOREIGN KEY (submission_evidence_id)
            REFERENCES public.application_evidence(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Indexes for application_evidence
CREATE INDEX IF NOT EXISTS idx_application_evidence_user ON public.application_evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_application_evidence_app ON public.application_evidence(application_id);
CREATE INDEX IF NOT EXISTS idx_application_evidence_captured ON public.application_evidence(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_evidence_run ON public.application_evidence(browser_run_id);

-- Enable RLS on application_evidence
ALTER TABLE public.application_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own application evidence" ON public.application_evidence;
CREATE POLICY "Users can view own application evidence"
    ON public.application_evidence
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own application evidence" ON public.application_evidence;
CREATE POLICY "Users can insert own application evidence"
    ON public.application_evidence
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own application evidence" ON public.application_evidence;
CREATE POLICY "Users can update own application evidence"
    ON public.application_evidence
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. Create public.application_status_events table (Immutable Provenance History)
CREATE TABLE IF NOT EXISTS public.application_status_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    previous_status TEXT,
    next_status TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN (
        'BROWSER_CONFIRMATION',
        'EMPLOYER_INTEGRATION',
        'USER_REPORTED',
        'PLATFORM'
    )),
    evidence_id UUID REFERENCES public.application_evidence(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    idempotency_key TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to enforce idempotency and prevent duplicate event processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_status_events_idempotency
    ON public.application_status_events(application_id, idempotency_key);

-- Query performance indexes
CREATE INDEX IF NOT EXISTS idx_app_status_events_user ON public.application_status_events(user_id);
CREATE INDEX IF NOT EXISTS idx_app_status_events_app_recorded ON public.application_status_events(application_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_status_events_user_recorded ON public.application_status_events(user_id, recorded_at DESC);

-- Enable RLS on application_status_events
ALTER TABLE public.application_status_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own application status events" ON public.application_status_events;
CREATE POLICY "Users can view own application status events"
    ON public.application_status_events
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own application status events" ON public.application_status_events;
CREATE POLICY "Users can insert own application status events"
    ON public.application_status_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
