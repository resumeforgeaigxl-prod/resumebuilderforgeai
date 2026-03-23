-- PrepForge Tables for AI Generated Questions
CREATE TABLE IF NOT EXISTS public.prep_forge_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('coding', 'aptitude', 'reasoning')),
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    problem TEXT NOT NULL,
    input_output TEXT,
    approach JSONB NOT NULL DEFAULT '[]'::JSONB,
    code TEXT,
    line_explanation JSONB DEFAULT '[]'::JSONB,
    variations JSONB DEFAULT '[]'::JSONB,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prep_questions_type_topic ON public.prep_forge_questions(type, topic);
CREATE INDEX IF NOT EXISTS idx_prep_questions_slug ON public.prep_forge_questions(slug);

-- RLS
ALTER TABLE public.prep_forge_questions ENABLE ROW LEVEL SECURITY;

-- Policies for public reading
CREATE POLICY "Anyone can view active prep questions" 
ON public.prep_forge_questions FOR SELECT 
USING (is_active = true);

-- Note: Insert/Update handled by Service Role in API routes
