-- Add is_mnc column to jobs table (run this in Supabase SQL editor)
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS is_mnc BOOLEAN DEFAULT FALSE;

-- Add index for fast MNC filtering
CREATE INDEX IF NOT EXISTS idx_jobs_is_mnc ON jobs (is_mnc);

CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs (source);

CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs (posted_at DESC);

-- Ensure unique constraint on external_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'jobs_external_id_key'
    ) THEN
        ALTER TABLE jobs ADD CONSTRAINT jobs_external_id_key UNIQUE (external_id);

END IF;

END $$;