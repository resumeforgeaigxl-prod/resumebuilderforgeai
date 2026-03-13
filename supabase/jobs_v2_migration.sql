-- Upgrade jobs table for unified ingestion
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type TEXT; 
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';

-- Ensure company and location are not null for unique constraint stability
UPDATE jobs SET company = 'Unknown' WHERE company IS NULL;
UPDATE jobs SET location = 'Remote' WHERE location IS NULL;

-- Delete exact duplicates before creating index
DELETE FROM jobs a USING (
      SELECT MIN(ctid) as ctid, title, company, location
      FROM jobs 
      GROUP BY title, company, location 
      HAVING COUNT(*) > 1
) b
WHERE a.title = b.title 
  AND a.company = b.company 
  AND a.location = b.location 
  AND a.ctid <> b.ctid;

ALTER TABLE jobs ALTER COLUMN company SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN company SET DEFAULT 'Unknown';
ALTER TABLE jobs ALTER COLUMN location SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN location SET DEFAULT 'Remote';

-- Add unique constraint for deduplication
DROP INDEX IF EXISTS idx_jobs_deduplication;
CREATE UNIQUE INDEX idx_jobs_deduplication ON jobs (title, company, location);
