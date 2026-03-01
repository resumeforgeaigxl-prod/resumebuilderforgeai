-- ============================================================
-- ResumeForge AI — JobForgeAI Controlled Architecture
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Add display_name to users if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='display_name') THEN
        ALTER TABLE public.users ADD COLUMN display_name text;
    END IF;
END $$;

-- 1. AI User Settings Table
CREATE TABLE IF NOT EXISTS public.ai_user_settings (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    ai_terms_accepted_at timestamp
    with
        time zone,
        UNIQUE (user_id)
);

ALTER TABLE public.ai_user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai settings" ON public.ai_user_settings FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own ai settings" ON public.ai_user_settings FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own ai settings" ON public.ai_user_settings FOR
UPDATE USING (auth.uid () = user_id);

-- 2. AI Violations Table
CREATE TABLE IF NOT EXISTS public.ai_violations (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    message text NOT NULL,
    violation_type text,
    created_at timestamp
    with
        time zone DEFAULT now()
);

ALTER TABLE public.ai_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own violations" ON public.ai_violations FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Admins can view all violations" ON public.ai_violations FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE
                users.id = auth.uid ()
                AND users.role = 'admin'
        )
    );
-- Service role bypasses RLS for inserting violations

-- 3. AI Chats Table
CREATE TABLE IF NOT EXISTS public.ai_chats (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    role text NOT NULL CHECK (
        role IN ('user', 'assistant', 'system')
    ),
    message text NOT NULL,
    created_at timestamp
    with
        time zone DEFAULT now()
);

ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats" ON public.ai_chats FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Admins can view all chats" ON public.ai_chats FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE
                users.id = auth.uid ()
                AND users.role = 'admin'
        )
    );
-- Service role bypasses RLS for inserting chats

-- Re-verify
SELECT 'AI Tables created successfully.' as status;