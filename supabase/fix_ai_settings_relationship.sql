-- Fix AI User Settings to reference the correct public.users table
-- The original migration used auth.users which fails for custom OAuth implementations.

-- 1. Drop the existing table if it exists (we'll recreate it correctly)
-- Warning: This clears AI terms acceptance status for existing users,
-- but since it wasn't working anyway, this is the safest fix.
DROP TABLE IF EXISTS public.ai_user_settings CASCADE;

-- 2. Create it with reference to public.users
CREATE TABLE public.ai_user_settings (
    id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    ai_terms_accepted_at timestamp
    with
        time zone,
        UNIQUE (user_id)
);

-- 3. Enable RLS
ALTER TABLE public.ai_user_settings ENABLE ROW LEVEL SECURITY;

-- 4. Service role full access policy
CREATE POLICY "Service role full access ai_settings" ON public.ai_user_settings FOR ALL USING (true)
WITH
    CHECK (true);

-- 5. Ensure display_name exists in users
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='display_name') THEN
        ALTER TABLE public.users ADD COLUMN display_name text;

END IF;

END $$;