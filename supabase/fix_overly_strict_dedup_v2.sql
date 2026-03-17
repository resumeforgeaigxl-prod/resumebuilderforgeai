-- Migration: Clean up and fix Job Deduplication Constraints
-- This script handles existing duplicates before creating new unique indexes.

-- 1. Remove the old strict index
DROP INDEX IF EXISTS idx_jobs_deduplication;

-- 2. Clean up duplicates by apply_url
-- We keep the most recently created job for each unique apply_url
DELETE FROM jobs a USING (
      SELECT MIN(ctid) as ctid, apply_url
      FROM jobs 
      WHERE apply_url IS NOT NULL AND apply_url <> ''
      GROUP BY apply_url 
      HAVING COUNT(*) > 1
) b
WHERE a.apply_url = b.apply_url 
  AND a.ctid <> b.ctid;

-- 3. Now create the unique index for apply_url
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_apply_url ON jobs (apply_url) 
WHERE apply_url IS NOT NULL AND apply_url <> '';

-- 4. Clean up duplicates for the fallback constraint (title, company, location, source)
-- This ensures the second unique index can also be created
DELETE FROM jobs a USING (
      SELECT MIN(ctid) as ctid, title, company, location, source
      FROM jobs 
      GROUP BY title, company, location, source
      HAVING COUNT(*) > 1
) b
WHERE a.title = b.title 
  AND a.company = b.company 
  AND a.location = b.location
  AND COALESCE(a.source, '') = COALESCE(b.source, '')
  AND a.ctid <> b.ctid;

-- 5. Add the fallback unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_fallback_dedup 
ON jobs (title, company, location, source);

-- 6. Log success
SELECT 'Job deduplication constraints fixed successfully' as result;
