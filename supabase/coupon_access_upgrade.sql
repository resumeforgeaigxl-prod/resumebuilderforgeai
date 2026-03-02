-- Add plan and access_expires_at to users table for direct access management
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;

-- Ensure RLS allows reading these fields
-- (Existing policies usually cover all columns for service role)