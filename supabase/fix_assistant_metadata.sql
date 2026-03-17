-- Add metadata to chat_messages for storing actions and other extra data
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Re-verify
SELECT 'Metadata column added to chat_messages' as status;
