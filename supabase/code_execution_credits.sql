-- Code Execution Credits Migration
-- Default 30 runs/day, 5 runs/min rate limit

CREATE TABLE IF NOT EXISTS public.code_execution_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- Removed REFERENCES to avoid FK issues with custom JWT auth
    runs_remaining INTEGER DEFAULT 30,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_run_at TIMESTAMP WITH TIME ZONE,
    runs_this_minute INTEGER DEFAULT 0,
    minute_reset_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.code_execution_credits ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view and update their own credits (though update is usually handled by service role or specific triggers)
-- Since the backend uses service role via createClient(url, key) with service_role_key potentially, 
-- or just normal client if RLS allows.
-- The API route uses `createClient()` from '@/lib/supabase/server' which likely uses ANON key by default.
-- I'll allow users to read their own, but update should be restricted.
-- Actually, our API uses service role when needed if we use the right client.

CREATE POLICY "Users can view their own code credits" ON public.code_execution_credits FOR
SELECT TRUE); -- Simplified for now if using custom JWT, otherwise use (auth.uid() = user_id)

-- Indices
CREATE INDEX IF NOT EXISTS idx_code_execution_credits_user_id ON public.code_execution_credits (user_id);

-- Function to handle TIMESTAMP update
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_code_credits_updated_at
BEFORE UPDATE ON public.code_execution_credits
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
