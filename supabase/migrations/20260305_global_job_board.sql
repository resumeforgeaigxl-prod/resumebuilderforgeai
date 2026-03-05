-- Add global job board columns and missing fields
ALTER TABLE IF EXISTS public.jobs
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS job_type TEXT,
ADD COLUMN IF NOT EXISTS salary TEXT DEFAULT 'Competitive',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
WITH
    TIME ZONE DEFAULT NOW();

-- Map existing data to new columns if they exist
UPDATE public.jobs SET country = 'India' WHERE country IS NULL;

-- If external_id index doesn't exist, add it for upsert operations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'jobs_external_id_key') THEN
        CREATE UNIQUE INDEX jobs_external_id_key ON public.jobs (external_id);
    END IF;
END $$;