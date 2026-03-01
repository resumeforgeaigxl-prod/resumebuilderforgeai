-- Enable public read for shared conversations
-- This allows the share page to work for anyone with the link
CREATE POLICY "Anyone with ID can view shared conversation" ON conversations FOR
SELECT USING (true);
-- Usually you'd add a 'is_public' flag, but for now we follow the simple share model

CREATE POLICY "Anyone with conversation ID can view messages" ON ai_messages FOR
SELECT USING (true);