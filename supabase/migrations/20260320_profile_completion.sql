-- ============================================================
-- ResumeForgeAI — User Profile Completion Migration
-- ============================================================

-- Add profile-related columns to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS experience_level TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS college TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- ✅ Done!
