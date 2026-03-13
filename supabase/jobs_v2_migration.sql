-- Upgrade jobs table for unified ingestion
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type TEXT; -- mapping to employment_type
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';

-- Ensure company and location are not null for unique constraint stability
UPDATE jobs SET company = 'Unknown' WHERE company IS NULL;
UPDATE jobs SET location = 'Remote' WHERE location IS NULL;

ALTER TABLE jobs ALTER COLUMN company SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN company SET DEFAULT 'Unknown';
ALTER TABLE jobs ALTER COLUMN location SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN location SET DEFAULT 'Remote';

-- Add unique constraint for deduplication
-- We drop first if exists to avoid errors on multiple runs
DROP INDEX IF EXISTS idx_jobs_deduplication;
CREATE UNIQUE INDEX idx_jobs_deduplication ON jobs (title, company, location);

-- Source field enum check is not strictly needed but good for documentation
-- source values: jsearch, adzuna, apify, jobforgecollector
