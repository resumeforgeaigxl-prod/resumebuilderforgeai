-- Migration: Upgrade to Interview Intelligence System

-- 1. Create Interview Intelligence Reports Cache
CREATE TABLE IF NOT EXISTS public.interview_intelligence_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    hiring_process JSONB NOT NULL, -- Rounds and difficulty
    top_questions JSONB NOT NULL, -- Aggregated questions with frequency/difficulty
    topic_heatmap JSONB NOT NULL, -- Data for visualization
    prep_roadmap JSONB NOT NULL, -- Daily plan
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company, role)
);

-- 2. Create Interview Calendar
CREATE TABLE IF NOT EXISTS public.interview_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    interview_date DATE NOT NULL,
    notes TEXT,
    reminders_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Extend mock_interviews with detailed scoring
ALTER TABLE public.mock_interviews
ADD COLUMN IF NOT EXISTS detailed_scores JSONB;
-- Stores { technical: 7, communication: 6, problem_solving: 8, confidence: 7 }

-- Enable RLS
ALTER TABLE public.interview_intelligence_reports ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.interview_calendar ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role full access reports" ON public.interview_intelligence_reports USING (true)
WITH
    CHECK (true);

CREATE POLICY "Service role full access calendar" ON public.interview_calendar USING (true)
WITH
    CHECK (true);