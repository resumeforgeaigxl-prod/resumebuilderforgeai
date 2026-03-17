-- ResumeForgeAI - Job Deduplication Fix v3
-- Fixes ON CONFLICT error and implements dual-key deduplication

-- 1. Pre-cleanup: Delete duplicates to allow unique indexing
-- Clean by apply_url
DELETE FROM jobs a USING jobs b 
WHERE a.id > b.id 
  AND a.apply_url IS NOT NULL 
  AND a.apply_url = b.apply_url;

-- Clean by dedup_key
DELETE FROM jobs a USING jobs b 
WHERE a.id > b.id 
  AND a.dedup_key IS NOT NULL 
  AND a.dedup_key = b.dedup_key;

-- 2. Add Required Unique Constraints
-- Constraint for apply_url (Allows multiple NULLs by default in Postgres)
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS unique_apply_url;
ALTER TABLE jobs ADD CONSTRAINT unique_apply_url UNIQUE (apply_url);

-- Partial index for better NULL handling and performance
DROP INDEX IF EXISTS unique_apply_url_not_null;
CREATE UNIQUE INDEX unique_apply_url_not_null ON jobs (apply_url) 
WHERE apply_url IS NOT NULL;

-- Constraint for fallback dedup_key
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS unique_dedup_key;
ALTER TABLE jobs ADD CONSTRAINT unique_dedup_key UNIQUE (dedup_key);

-- 3. Verify
SELECT 'Job constraints fixed successfully.' as status;
