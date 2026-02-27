-- ============================================================
-- ResumeForge AI — Mock Test Engine Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Mock Tests table
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id uuid REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    job_title TEXT,
    job_description TEXT NOT NULL,
    resume_text TEXT,
    total_questions INT NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Mock Questions table
CREATE TABLE IF NOT EXISTS public.mock_questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    test_id uuid REFERENCES public.mock_tests (id) ON DELETE CASCADE NOT NULL,
    question_number INT NOT NULL,
    category TEXT NOT NULL, -- 'technical' | 'aptitude' | 'verbal' | 'logical' | 'interview'
    difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy' | 'medium' | 'hard'
    question TEXT NOT NULL,
    options JSONB, -- ["A. ...", "B. ...", "C. ...", "D. ..."] — null for interview Qs
    correct_answer TEXT, -- "A"/"B"/"C"/"D" — null for interview Qs
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS (same pattern as other tables)
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mock_questions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mock_tests' AND policyname='Service role full access mock_tests') THEN
        CREATE POLICY "Service role full access mock_tests" ON public.mock_tests USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mock_questions' AND policyname='Service role full access mock_questions') THEN
        CREATE POLICY "Service role full access mock_questions" ON public.mock_questions USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Verify:
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('mock_tests','mock_questions');