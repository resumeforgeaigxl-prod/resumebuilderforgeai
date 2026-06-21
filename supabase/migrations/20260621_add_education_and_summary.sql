-- Migration to add education (JSONB), professional_summary (TEXT), portfolio_url (TEXT), target_role (TEXT), and preferred_work_mode (TEXT) columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS professional_summary TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS target_role TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_work_mode TEXT;
