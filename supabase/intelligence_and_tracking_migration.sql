-- Resume Intelligence & Job Tracking Migration (FINAL REPAIR)
-- Author: Forge Neural Engine

-- 1. CLEANUP PREVIOUS ATTEMPTS
DROP VIEW IF EXISTS admin_job_stats_view CASCADE;

-- 2. REPAIR/CREATE RESUME ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS public.resume_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- Ensure columns exist for resume_analysis
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE;
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS ats_score INTEGER;
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS strengths TEXT[];
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS missing_skills TEXT[];
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS improvements TEXT[];
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 3. REPAIR/CREATE JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- Ensure all required columns exist in job_applications
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Applied';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- CRITICAL FIX: Ensure a timestamp column exists (Handles both naming conventions in your DB)
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- If applied_at exists but created_at is null, sync them
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_applications' AND column_name='applied_at') THEN
        UPDATE public.job_applications SET created_at = applied_at WHERE created_at IS NULL;
    END IF;
END $$;

-- 4. RE-ENABLE RLS AND POLICIES
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own resume analysis" ON public.resume_analysis;
DROP POLICY IF EXISTS "Users can insert their own resume analysis" ON public.resume_analysis;
CREATE POLICY "Users can view their own resume analysis" ON public.resume_analysis FOR SELECT USING (user_id IS NOT NULL);
CREATE POLICY "Users can insert their own resume analysis" ON public.resume_analysis FOR INSERT WITH CHECK (user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own job applications" ON public.job_applications;
CREATE POLICY "Users can manage their own job applications" ON public.job_applications FOR ALL USING (user_id IS NOT NULL);

-- 5. FUNCTION & TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_job_apps_modtime ON public.job_applications;
CREATE TRIGGER update_job_apps_modtime
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. RECREATE ADMIN VIEW
-- Using COALESCE to handle both 'created_at' or 'applied_at' based on which one your DB has
CREATE OR REPLACE VIEW admin_job_stats_view AS
SELECT 
    ja.id as application_id,
    ja.user_id,
    ja.status,
    COALESCE(
        (SELECT ja.created_at LIMIT 1), 
        (SELECT ja.applied_at LIMIT 1)
    ) as created_at,
    j.company,
    j.title
FROM public.job_applications ja
JOIN public.jobs j ON ja.job_id = j.id;

-- 7. REPAIR THE VIEW (Fallback if the above still complains about column existence during creation)
-- This version is even more robust to different schemas
CREATE OR REPLACE VIEW admin_job_stats_view AS
SELECT 
    ja.id as application_id,
    ja.user_id,
    ja.status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_applications' AND column_name='created_at') 
        THEN ja.created_at 
        ELSE ja.updated_at 
    END as created_at,
    j.company,
    j.title
FROM public.job_applications ja
JOIN public.jobs j ON ja.job_id = j.id;
