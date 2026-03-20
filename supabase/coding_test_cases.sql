-- CodingForge Test Case System

CREATE TABLE IF NOT EXISTS public.coding_test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.coding_questions(id) ON DELETE CASCADE NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Policies
ALTER TABLE public.coding_test_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public test cases" ON public.coding_test_cases
    FOR SELECT USING (is_hidden = false);

-- Since backend uses service role, it can always see hidden ones.
-- If user is logged in, they can view cases they own or those belonging to problems?
-- Usually, we hide inputs of hidden tests.

CREATE INDEX IF NOT EXISTS idx_coding_test_cases_question_id ON public.coding_test_cases(question_id);
