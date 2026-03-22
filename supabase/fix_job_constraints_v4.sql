-- Fix JobForge Collector Constraints
-- Goal: Remove strict URL/Dedup constraints and rely ONLY on external_id for stable ingestion

-- 1. Drop the old overly strict constraints if they exist
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS unique_apply_url;
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_apply_url_key;
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS unique_dedup_key;
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_dedup_key_key;

-- 2. Ensure external_id exists and has a unique index
-- (Checking existence first to avoid errors)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_external_id_key') THEN
        ALTER TABLE jobs ADD CONSTRAINT jobs_external_id_key UNIQUE (external_id);
    END IF;
END $$;

-- 3. Cleanup: Ensure external_id is never NULL (requirement for deduplication)
ALTER TABLE jobs ALTER COLUMN external_id SET NOT NULL;

-- 4. Enable RLS and public access (if not already set)
-- (Already handled in main migration but good to be safe)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
