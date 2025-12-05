-- Only add policies for temporary_chat_settings table
ALTER TABLE temporary_chat_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert settings"
ON temporary_chat_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to read their settings"
ON temporary_chat_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their settings"
ON temporary_chat_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their settings"
ON temporary_chat_settings FOR DELETE
USING (auth.uid() = user_id);
