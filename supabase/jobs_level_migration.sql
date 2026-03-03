-- Add `level` column to classify jobs by experience level
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'experienced';

-- Backfill existing rows based on title keywords
UPDATE jobs
SET
    level = 'fresher'
WHERE
    lower(title) SIMILAR TO '%(intern|internship|fresher|junior|entry.?level|trainee|graduate)%';

-- Index for fast section queries
CREATE INDEX IF NOT EXISTS idx_jobs_level ON jobs (level);

CREATE INDEX IF NOT EXISTS idx_jobs_level_posted ON jobs (level, posted_at DESC);