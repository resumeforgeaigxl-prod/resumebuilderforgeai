-- ExplainForge AI Storage Migration
-- Purpose: Enable persistent storage for project analyses and generated reports.

-- 1. Create the requests table
CREATE TABLE IF NOT EXISTS explainforge_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    input_type TEXT NOT NULL, -- 'description', 'file', 'github'
    input_content TEXT,
    github_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the outputs table
CREATE TABLE IF NOT EXISTS explainforge_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES explainforge_requests(id) ON DELETE CASCADE,
    human_explanation TEXT,
    interview_explanation TEXT,
    viva_explanation TEXT,
    report_content JSONB, -- Stores the full report sections
    diagrams JSONB, -- Stores Mermaid definitions
    algorithms JSONB, -- Stores array of algorithmic explanations
    questions JSONB, -- Stores array of Q&A
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the files table
CREATE TABLE IF NOT EXISTS explainforge_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES explainforge_requests(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE explainforge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE explainforge_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE explainforge_files ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies
CREATE POLICY "Users can view their own explainforge requests" 
    ON explainforge_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own explainforge requests" 
    ON explainforge_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Outputs and Files follow the request mapping
CREATE POLICY "Users can view their own explainforge outputs" 
    ON explainforge_outputs FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM explainforge_requests 
            WHERE explainforge_requests.id = explainforge_outputs.request_id 
            AND explainforge_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own explainforge files" 
    ON explainforge_files FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM explainforge_requests 
            WHERE explainforge_requests.id = explainforge_files.request_id 
            AND explainforge_requests.user_id = auth.uid()
        )
    );

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_explainforge_requests_user ON explainforge_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_explainforge_outputs_request ON explainforge_outputs(request_id);
CREATE INDEX IF NOT EXISTS idx_explainforge_files_request ON explainforge_files(request_id);

-- 7. Buckets can usually only be created via SQL with specific extensions, 
-- but we define the policy here assuming the bucket "explainforge-files" and "explainforge-reports" exists.
-- Storage policies are usually handled in the Supabase Dashboard, but for reference:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('explainforge-files', 'explainforge-files', false);
