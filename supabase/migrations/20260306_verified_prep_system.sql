-- Verified Company Interview Preparation System Migration

-- 1. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    industry TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, role_name)
);

-- 3. Interview Rounds Table
CREATE TABLE IF NOT EXISTS public.interview_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    role_id UUID NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE,
    round_type TEXT NOT NULL CHECK (
        round_type IN (
            'Online Assessment',
            'Aptitude Test',
            'Technical Interview',
            'System Design',
            'HR Interview'
        )
    ),
    UNIQUE (role_id, round_type)
);

-- 4. Interview Questions Table
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES public.interview_rounds(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    frequency_score INTEGER DEFAULT 1,
    verified BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'user_submission' CHECK (source IN ('admin_seed', 'user_submission')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Interview Submissions Table
CREATE TABLE IF NOT EXISTS public.interview_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    role_name TEXT NOT NULL,
    round_type TEXT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for Performance
CREATE INDEX IF NOT EXISTS idx_roles_company_id ON public.roles (company_id);

CREATE INDEX IF NOT EXISTS idx_rounds_role_id ON public.interview_rounds (role_id);

CREATE INDEX IF NOT EXISTS idx_questions_round_id ON public.interview_questions (round_id);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.interview_submissions (status);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.interview_submissions (user_id);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.interview_rounds ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.interview_submissions ENABLE ROW LEVEL SECURITY;

-- Policies: All can read verified data
CREATE POLICY "Anyone can view companies" ON public.companies FOR
SELECT USING (true);

CREATE POLICY "Anyone can view roles" ON public.roles FOR
SELECT USING (true);

CREATE POLICY "Anyone can view rounds" ON public.interview_rounds FOR
SELECT USING (true);

CREATE POLICY "Anyone can view verified questions" ON public.interview_questions FOR
SELECT USING (verified = true);

-- Policies: Users can view their own submissions
CREATE POLICY "Users can view their own submissions" ON public.interview_submissions FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert submissions" ON public.interview_submissions FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Admin Policies: Admin can do everything
-- Note: Replace 'admin' check with your actual admin role logic if different
CREATE POLICY "Admins have full access to companies" ON public.companies FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

CREATE POLICY "Admins have full access to roles" ON public.roles FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

CREATE POLICY "Admins have full access to rounds" ON public.interview_rounds FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

CREATE POLICY "Admins have full access to questions" ON public.interview_questions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

CREATE POLICY "Admins have full access to submissions" ON public.interview_submissions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);