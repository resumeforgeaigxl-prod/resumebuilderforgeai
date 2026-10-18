-- ==============================================================================
-- ResumeForgeAI — Level 7: Canonical Job Ingestion Pipeline Migration
-- ==============================================================================
-- 1. Extend public.jobs with canonical metadata (normalized title, salary,
--    experience, remote type, skills, canonical URL, lifecycle timestamps)
-- 2. Create public.job_sources to track multi-source provenance (Growx Crawl,
--    Adzuna, Web Search, ATS) mapping to a single canonical job.
-- ==============================================================================

-- 1. Canonical metadata columns on public.jobs
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS normalized_title TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_domain TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location_text TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS remote_type TEXT DEFAULT 'UNKNOWN';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_min NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_max NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_min NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_max NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'INR';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_period TEXT DEFAULT 'YEAR';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS source_job_id TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS discovered_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fast lookup indexes for canonical queries and deduplication
CREATE INDEX IF NOT EXISTS idx_jobs_canonical_url ON public.jobs (canonical_url);
CREATE INDEX IF NOT EXISTS idx_jobs_normalized_title ON public.jobs (normalized_title);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_last_seen_at ON public.jobs (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON public.jobs (city);
CREATE INDEX IF NOT EXISTS idx_jobs_remote_type ON public.jobs (remote_type);

-- 2. Multi-source occurrence tracking table
CREATE TABLE IF NOT EXISTS public.job_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    source TEXT NOT NULL, -- 'growx_crawl', 'adzuna', 'web_search', 'gemini_grounding', 'greenhouse', 'lever', 'ashby'
    source_job_id TEXT,
    source_url TEXT,
    apply_url TEXT,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_sources_job_id ON public.job_sources (job_id);
CREATE INDEX IF NOT EXISTS idx_job_sources_source ON public.job_sources (source);
CREATE INDEX IF NOT EXISTS idx_job_sources_apply_url ON public.job_sources (apply_url);
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_sources_unique_source_id 
    ON public.job_sources (source, source_job_id) 
    WHERE source_job_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access job_sources" ON public.job_sources USING (true)
WITH CHECK (true);

-- Allow public read access
CREATE POLICY "Allow public read access job_sources" ON public.job_sources FOR SELECT USING (true);
