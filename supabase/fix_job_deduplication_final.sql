-- ResumeForgeAI - Job Deduplication Fix 
-- Author: Forge Collector System

-- 1. Remove the old, overly strict constraint
DROP INDEX IF EXISTS idx_jobs_deduplication;

-- 2. Add dedup_key column for hash-based fallback
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dedup_key TEXT;

-- 3. Pre-cleanup: Delete duplicates to allow unique indexing
-- Delete by apply_url
DELETE FROM jobs a USING (
      SELECT MIN(id::text)::uuid as id, apply_url
      FROM jobs 
      WHERE apply_url IS NOT NULL
      GROUP BY apply_url 
      HAVING COUNT(*) > 1
) b
WHERE a.apply_url = b.apply_url 
  AND a.id <> b.id;

-- Delete by dedup_key (if any already exist)
DELETE FROM jobs a USING (
      SELECT MIN(id::text)::uuid as id, dedup_key
      FROM jobs 
      WHERE dedup_key IS NOT NULL
      GROUP BY dedup_key 
      HAVING COUNT(*) > 1
) b
WHERE a.dedup_key = b.dedup_key 
  AND a.id <> b.id;

-- 4. Create Unique Indexes
-- Primary Unique: apply_url
DROP INDEX IF EXISTS idx_jobs_apply_url;
CREATE UNIQUE INDEX idx_jobs_apply_url ON jobs (apply_url) WHERE apply_url IS NOT NULL;

-- Fallback Unique: dedup_key
DROP INDEX IF EXISTS idx_jobs_dedup_key;
CREATE UNIQUE INDEX idx_jobs_dedup_key ON jobs (dedup_key) WHERE dedup_key IS NOT NULL;

-- 5. Add index on external_id just in case it's still used by code
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs (external_id);

SELECT 'Job deduplication schema updated successfully.' as status;
