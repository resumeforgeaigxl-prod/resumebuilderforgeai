-- Interview Calendar Migration

CREATE TABLE IF NOT EXISTS public.interview_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role_name TEXT NOT NULL,
    interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_calendar_user_id ON public.interview_calendar (user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_date ON public.interview_calendar (interview_date);

-- RLS
ALTER TABLE public.interview_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar" ON public.interview_calendar FOR ALL USING (auth.uid () = user_id);