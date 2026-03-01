-- Migration to add reset password support to custom users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS reset_token text,
ADD COLUMN IF NOT EXISTS reset_token_expires_at timestamptz;

-- Add index for token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON public.users (reset_token);