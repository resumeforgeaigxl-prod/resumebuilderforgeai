-- Create cover_letters table
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    resume_id UUID REFERENCES public.resumes (id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    role_title TEXT,
    company_name TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- Service role bypass
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cover_letters' AND policyname = 'Service role full access cover_letters'
    ) THEN
        CREATE POLICY "Service role full access cover_letters" ON public.cover_letters USING (true) WITH CHECK (true);
    END IF;
END $$;