-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create ai_messages table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (
        role IN ('user', 'assistant', 'system')
    ),
    content TEXT NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations (user_id);

CREATE INDEX IF NOT EXISTS idx_ai_messages_convo ON ai_messages (conversation_id);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations FOR
SELECT TO authenticated USING (auth.uid () = user_id);

CREATE POLICY "Users can insert their own conversations" ON conversations FOR
INSERT
    TO authenticated
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update their own conversations" ON conversations FOR
UPDATE TO authenticated USING (auth.uid () = user_id);

-- Policies for ai_messages
CREATE POLICY "Users can view messages for their conversations" ON ai_messages FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM conversations
            WHERE
                conversations.id = ai_messages.conversation_id
                AND conversations.user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can insert messages for their conversations" ON ai_messages FOR
INSERT
    TO authenticated
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM conversations
            WHERE
                conversations.id = ai_messages.conversation_id
                AND conversations.user_id = auth.uid ()
        )
    );

-- Admin Policies
CREATE POLICY "Admins can view all conversations" ON conversations FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                users.id = auth.uid ()
                AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all messages" ON ai_messages FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                users.id = auth.uid ()
                AND users.role = 'admin'
        )
    );