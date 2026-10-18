-- ==============================================================================
-- ResumeForgeAI — Level 9: Public SEO Jobs Layer & Google Indexing
-- ==============================================================================
-- 1. Add slug column and index to public.jobs for fast SEO lookups
-- 2. Add application_method column to public.job_applications for manual tracking
-- 3. Add high-efficiency indexes for public discovery and sitemap generation
-- ==============================================================================

-- 1. Add slug to public.jobs
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs (slug);

-- 2. Efficient compound index for active public discovery & sitemaps
CREATE INDEX IF NOT EXISTS idx_jobs_status_discovered ON public.jobs (status, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status_verified ON public.jobs (status, last_verified_at DESC);

-- 3. Extend job_applications with application_method ('MANUAL' or 'OMNI_AGENT')
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS application_method TEXT DEFAULT 'MANUAL';
CREATE INDEX IF NOT EXISTS idx_job_applications_method ON public.job_applications (application_method);
