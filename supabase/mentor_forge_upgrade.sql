-- MentorForge Chat History Persistence
CREATE TABLE IF NOT EXISTS mentor_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MentorForge Permissions (Extending existing logic if not present)
CREATE TABLE IF NOT EXISTS mentor_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    forge_name VARCHAR(50) NOT NULL,
    permission_granted BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, forge_name)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_mentor_chats_user ON mentor_chats(user_id, created_at ASC);

-- Add delete policy for GDPR/User control
ALTER TABLE mentor_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own chats" ON mentor_chats
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE mentor_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own permissions" ON mentor_permissions
    FOR SELECT USING (auth.uid() = user_id);
