-- Migration to add password_hash to users table for credentials-based signup
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Verify the column was added
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash';