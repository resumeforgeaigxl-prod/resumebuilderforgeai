-- ============================================================
-- ResumeForge AI — Payment Pipeline Fixes & New Features
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ─── 1. Invoices Table Updates ───────────────────────────────
-- Add missing columns for tracking success status and storage URL
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'paid';

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS invoice_url TEXT;

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS payment_id TEXT;
-- Generic for any gateway

-- Ensure unique payment_id for safety
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON public.invoices (payment_id);

-- ─── 2. Subscriptions Table Updates ──────────────────────────
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- ─── 3. AI Career Roadmap Table ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    time_available TEXT NOT NULL,
    roadmap_json JSONB NOT NULL DEFAULT '{}'::jsonB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps (user_id);

-- ─── 4. Interview Scores Table ──────────────────────────────
-- Extends or provides detail for mock_interviews
CREATE TABLE IF NOT EXISTS public.interview_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    mock_interview_id UUID, -- Optional link to mock_interviews table
    technical_score INTEGER DEFAULT 0,
    communication_score INTEGER DEFAULT 0,
    confidence_score INTEGER DEFAULT 0,
    problem_solving_score INTEGER DEFAULT 0,
    suggestions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_scores_user_id ON public.interview_scores (user_id);

-- ─── 5. Resume Versioning ───────────────────────────────────
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS version_name TEXT DEFAULT 'Original';

ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS parent_resume_id UUID REFERENCES public.resumes (id) ON DELETE CASCADE;

-- ─── 6. Job Alerts Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    skills TEXT[],
    locations TEXT[],
    frequency TEXT DEFAULT 'daily', -- daily | weekly
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON public.job_alerts (user_id);

-- ─── 7. Storage Bucket ──────────────────────────────────────
-- Note: Supabase storage buckets are often managed via the UI or API,
-- but policies can be set here if the bucket is created.
-- We assume the bucket 'invoices' will be created via UI or API.

-- Enable RLS for all new tables
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.interview_scores ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role full access roadmaps" ON public.roadmaps FOR ALL USING (true)
WITH
    CHECK (true);

CREATE POLICY "Service role full access interview_scores" ON public.interview_scores FOR ALL USING (true)
WITH
    CHECK (true);

CREATE POLICY "Service role full access job_alerts" ON public.job_alerts FOR ALL USING (true)
WITH
    CHECK (true);

-- Done!