-- Create mock_interviews table for AI Mock Interview Tool
CREATE TABLE IF NOT EXISTS public.mock_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL,
    job_description TEXT,
    experience_level TEXT NOT NULL, -- 'fresher', 'junior', 'experienced'
    interview_type TEXT NOT NULL, -- 'technical', 'hr', 'mixed'
    num_questions INT NOT NULL,
    questions JSONB NOT NULL, -- array of question strings
    answers JSONB, -- array of answer strings
    scores JSONB, -- array of score objects {score: number, feedback: string, tips: string}
    final_score DECIMAL(5,2), -- overall percentage
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;

-- Service role bypass
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'mock_interviews' AND policyname = 'Service role full access mock_interviews'
    ) THEN
        CREATE POLICY "Service role full access mock_interviews" ON public.mock_interviews USING (true) WITH CHECK (true);
    END IF;
END $$;