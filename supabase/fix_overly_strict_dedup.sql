-- Migration: Loosen Job Deduplication Constraints
-- This script removes the strict (title, company, location) constraint 
-- and replaces it with a primary focus on apply_url.

-- 1. Drop the old overly strict index
DROP INDEX IF EXISTS idx_jobs_deduplication;

-- 2. Add a unique constraint to apply_url (after cleaning)
-- Note: We use a partial index if we want to allow multiple NULL apply_urls, 
-- but since we now use external_id as a hash fallback, external_id uniqueness is enough.
-- However, the user asked for PRIMARY UNIQUE KEY: (apply_url)

-- First, ensure external_id is the primary way we upsert.
-- If you want to strictly enforce apply_url uniqueness in DB:
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_apply_url ON jobs (apply_url) WHERE apply_url IS NOT NULL AND apply_url <> '';

-- 3. Add the fallback unique index (title, company, location, source)
-- This allows the same job to exist if it comes from a different source 
-- OR has a different location/title variation.
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_fallback_dedup ON jobs (title, company, location, source);

-- 4. Verify existing data doesn't violate these (optional cleanup)
-- Duplicate cleanup logic is handled by the ingestion service's external_id hash.
