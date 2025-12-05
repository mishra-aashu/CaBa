-- Messages table RLS policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert messages
CREATE POLICY "messages_insert_policy"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Allow users to read messages from their chats
CREATE POLICY "messages_read_policy"
ON messages FOR SELECT
USING (
  auth.uid() = sender_id 
  OR auth.uid() = receiver_id
);

-- Allow users to update their own messages
CREATE POLICY "messages_update_policy"
ON messages FOR UPDATE
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Allow users to delete their own messages
CREATE POLICY "messages_delete_policy"
ON messages FOR DELETE
USING (auth.uid() = sender_id);
