-- 20260306_optimized_resumes.sql
-- Create optimized_resumes table to store tailored resumes for specific jobs

CREATE TABLE IF NOT EXISTS public.optimized_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    original_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    optimized_resume JSONB NOT NULL,
    match_score INT DEFAULT 0,
    analysis JSONB DEFAULT '{}'::jsonb, -- Stores matched/missing keywords and bullet improvements
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.optimized_resumes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access optimized_resumes" ON public.optimized_resumes USING (true)
WITH
    CHECK (true);