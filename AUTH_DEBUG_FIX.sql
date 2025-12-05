-- Debug fix for authentication issues
-- This temporarily disables RLS on key tables to identify the root cause

-- Temporarily disable RLS on messages table for testing
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on temporary_chat_settings table for testing
ALTER TABLE public.temporary_chat_settings DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on chats table for testing
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on users table for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Add some test policies that are more permissive (for testing only)
-- Note: These are NOT secure - only for debugging
CREATE POLICY "temporary_allow_all_messages" ON public.messages
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "temporary_allow_all_temp_chat_settings" ON public.temporary_chat_settings
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "temporary_allow_all_chats" ON public.chats
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "temporary_allow_all_users" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS after testing
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.temporary_chat_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;