-- Fix JobForge Collector DB Constraints (Final Overhaul)
-- Objective: Ensure ONLY external_id is unique, removing all others on apply_url, dedup_key, etc.

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- 1. DROP ALL UNIQUE CONSTRAINTS except the Primary Key (id) and the one we want (external_id)
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'jobs'::regclass 
          AND contype = 'u' 
          AND conname NOT IN ('jobs_external_id_key', 'jobs_pkey', 'jobs_external_id_unique')
    ) LOOP
        EXECUTE 'ALTER TABLE jobs DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname) || ' CASCADE';
    END LOOP;

    -- 2. DROP ALL UNIQUE INDEXES manually just in case they aren't constraints
    FOR r IN (
        SELECT i.relname as indexname
        FROM pg_class t, pg_class i, pg_index ix, pg_attribute a
        WHERE t.oid = ix.indrelid
          AND i.oid = ix.indexrelid
          AND a.attrelid = t.oid
          AND a.attnum = ANY(ix.indkey)
          AND t.relkind = 'r'
          AND t.relname = 'jobs'
          AND ix.indisunique = true
          AND i.relname NOT IN ('jobs_external_id_key', 'jobs_pkey', 'jobs_external_id_unique')
    ) LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.indexname) || ' CASCADE';
    END LOOP;

    -- 3. ENSURE external_id has a unique index
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_external_id_key') THEN
        ALTER TABLE jobs ADD CONSTRAINT jobs_external_id_key UNIQUE (external_id);
    END IF;
END $$;

-- 4. Set external_id to NOT NULL
ALTER TABLE jobs ALTER COLUMN external_id SET NOT NULL;

-- 5. RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
