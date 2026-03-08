-- AI Roadmap and Job Alerts Migration

-- 1. AI Career Roadmaps Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    target_role TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    time_available TEXT NOT NULL,
    roadmap_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Job Alerts Table
CREATE TABLE IF NOT EXISTS public.job_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    skills TEXT[] DEFAULT '{}',
    locations TEXT[] DEFAULT '{}',
    frequency TEXT DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Interview Scores Table (for Mock Interviews)
CREATE TABLE IF NOT EXISTS public.interview_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    technical_score INTEGER DEFAULT 0,
    communication_score INTEGER DEFAULT 0,
    confidence_score INTEGER DEFAULT 0,
    problem_solving_score INTEGER DEFAULT 0,
    overall_readiness INTEGER DEFAULT 0,
    suggestions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Resume Scores Table (to match specific dashboard count)
CREATE TABLE IF NOT EXISTS public.resume_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER DEFAULT 0,
    feedback JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.interview_scores ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own roadmaps" ON public.roadmaps FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can manage their own job alerts" ON public.job_alerts FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can view their own interview scores" ON public.interview_scores FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can view their own resume scores" ON public.resume_scores FOR
SELECT USING (auth.uid () = user_id);

-- Indices
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps (user_id);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON public.job_alerts (user_id);

CREATE INDEX IF NOT EXISTS idx_interview_scores_user_id ON public.interview_scores (user_id);

CREATE INDEX IF NOT EXISTS idx_resume_scores_user_id ON public.resume_scores (user_id);