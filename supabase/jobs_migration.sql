-- Step 2: Create Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    external_id TEXT UNIQUE NOT NULL, -- ID from the API (JSearch job_id)
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    description TEXT,
    apply_url TEXT,
    employment_type TEXT, -- FULLTIME, INTERN, CONTRACTOR
    posted_at TIMESTAMP
    WITH
        TIME ZONE,
        source TEXT DEFAULT 'JSearch',
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone can see jobs)
CREATE POLICY "Allow public read access" ON jobs FOR
SELECT USING (true);

-- Allow service role to insert/update (upsert)
-- We'll use the service role key in the API route for the cron job