-- ==============================================================================
-- ResumeForgeAI — Level 10: Candidate ↔ Job Matching & Explainability Migration
-- ==============================================================================
-- Creates public.job_matches table for persisting explainable match scores,
-- confidence levels, component breakdowns, blockers, and recommendations.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    score INT NOT NULL, -- 0-100
    category TEXT NOT NULL, -- 'EXCELLENT' | 'STRONG' | 'POSSIBLE' | 'WEAK' | 'LOW'
    recommendation TEXT NOT NULL, -- 'EXCELLENT_APPLY' | 'STRONG_APPLY' | 'APPLY_IF_INTERESTED' | 'LOW_PRIORITY' | 'SKIP' | 'BLOCKED'
    confidence TEXT NOT NULL, -- 'HIGH' | 'MEDIUM' | 'LOW'
    component_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    blockers TEXT[] DEFAULT '{}',
    strong_matches TEXT[] DEFAULT '{}',
    partial_matches TEXT[] DEFAULT '{}',
    missing_requirements TEXT[] DEFAULT '{}',
    underrepresented_skills TEXT[] DEFAULT '{}',
    unknowns TEXT[] DEFAULT '{}',
    explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    candidate_profile_version TEXT,
    resume_version TEXT,
    job_updated_at TIMESTAMPTZ,
    match_algorithm_version TEXT DEFAULT 'v1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_job_matches_user_job UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_matches_user_rec ON public.job_matches(user_id, recommendation);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_score ON public.job_matches(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_job_matches_job_id ON public.job_matches(job_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_updated ON public.job_matches(user_id, updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access job_matches" 
    ON public.job_matches USING (true) WITH CHECK (true);

-- Authenticated user can view own matches
CREATE POLICY "Users can view own job_matches" 
    ON public.job_matches FOR SELECT 
    USING (auth.uid() = user_id);
