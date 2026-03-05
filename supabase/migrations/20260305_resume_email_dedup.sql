-- Add email_sent column to resumes table
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;

-- Ensure an index on user_id and created_at for fast deduplication checks
CREATE INDEX IF NOT EXISTS idx_resumes_user_id_created_at ON resumes (user_id, created_at);