-- ==============================================================================
-- ResumeForgeAI — Level 6: Candidate Application Profile Migration
-- ==============================================================================
-- 1. Extend public.users with identity & career attributes
-- 2. Create public.candidate_application_preferences (Job/Location/Salary preferences)
-- 3. Create public.candidate_application_answers (Verified Reusable Answer Bank)
-- ==============================================================================

-- 1. Identity & Career extensions on public.users (without duplicating identity)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_city TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_state TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_company TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_experience_years NUMERIC;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS primary_tech_stack TEXT[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS personal_website TEXT;

-- 2. Candidate Application Preferences Table
CREATE TABLE IF NOT EXISTS public.candidate_application_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    target_roles TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    remote_preference BOOLEAN DEFAULT TRUE,
    hybrid_preference BOOLEAN DEFAULT TRUE,
    onsite_preference BOOLEAN DEFAULT FALSE,
    min_expected_salary NUMERIC,
    preferred_salary_min NUMERIC,
    preferred_salary_max NUMERIC,
    salary_currency TEXT DEFAULT 'INR',
    employment_types TEXT[] DEFAULT '{"Full-time"}',
    industries TEXT[] DEFAULT '{}',
    companies_to_avoid TEXT[] DEFAULT '{}',
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    preferred_relocation_locations TEXT[] DEFAULT '{}',
    willing_to_travel BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_app_prefs_user_id ON public.candidate_application_preferences(user_id);

ALTER TABLE public.candidate_application_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access candidate_app_prefs" ON public.candidate_application_preferences USING (true)
WITH CHECK (true);

-- 3. Candidate Application Answers (Reusable Verified Answer Bank)
CREATE TABLE IF NOT EXISTS public.candidate_application_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    value_type TEXT NOT NULL DEFAULT 'string', -- 'string' | 'number' | 'boolean' | 'json' | 'array'
    status TEXT NOT NULL DEFAULT 'UNVERIFIED', -- 'VERIFIED' | 'UNVERIFIED' | 'UNKNOWN'
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT 'user', -- 'user' | 'resume' | 'account' | 'previous_application'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_candidate_app_answers_user_key UNIQUE (user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_candidate_app_answers_user_id ON public.candidate_application_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_app_answers_key ON public.candidate_application_answers(user_id, key);

ALTER TABLE public.candidate_application_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access candidate_app_answers" ON public.candidate_application_answers USING (true)
WITH CHECK (true);
