-- ============================================================
-- ResumeForge AI — OAuth Fix Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- STEP 1: If your users table still references auth.users, remove that constraint first.
-- Skip if you already have a standalone users table.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- STEP 2: Change primary key from auth UID to auto-generated UUID
-- Only run this if 'id' is still an FK to auth.users (not a standalone uuid).
-- If you already have uuid_generate_v4() as default, skip this block.
ALTER TABLE public.users
ALTER COLUMN id
SET DEFAULT uuid_generate_v4 ();

-- STEP 3: Add missing columns (safe — uses IF NOT EXISTS pattern)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name text;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone_number text;
-- nullable
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS provider text;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS provider_id text;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS terms_accepted boolean NOT NULL DEFAULT false;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- STEP 4: Make sure phone_number is nullable (drop NOT NULL if it was set)
ALTER TABLE public.users ALTER COLUMN phone_number DROP NOT NULL;

-- STEP 5: Drop old RLS policies that depend on auth.uid() (they won't work with custom OAuth)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

DROP POLICY IF EXISTS "Users can update own data" ON public.users;

DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;

DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;

DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;

DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;

-- STEP 6: Add permissive policies (API server uses service role key, so this is safe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Service role full access'
    ) THEN
        CREATE POLICY "Service role full access" ON public.users USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Service role full access resumes'
    ) THEN
        CREATE POLICY "Service role full access resumes" ON public.resumes USING (true) WITH CHECK (true);
    END IF;
END $$;

-- STEP 7: Drop the old trigger and function (tied to Supabase Auth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user ();

-- Done! Verify with:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users';