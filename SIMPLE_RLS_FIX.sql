-- ===========================================
-- SIMPLE RLS FIX FOR MESSAGES
-- Fix Row Level Security policies (no syntax errors)
-- ===========================================

-- STEP 1: Drop existing restrictive policies on messages
DROP POLICY IF EXISTS "Users can view messages they are part of" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages they send" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages they sent" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages they sent" ON public.messages;
DROP POLICY IF EXISTS "Enable read for users based on auth.uid()" ON public.messages;
DROP POLICY IF EXISTS "Enable insert for users based on auth.uid()" ON public.messages;
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON public.messages;

-- STEP 2: Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- STEP 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "messages_read_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON public.messages;

-- STEP 4: Create simple working RLS policies

-- Allow users to read messages where they are sender or receiver
CREATE POLICY "messages_read_policy" ON public.messages
    FOR SELECT
    USING (
        auth.uid() = sender_id OR
        auth.uid() = receiver_id
    );

-- Allow users to insert messages they send
CREATE POLICY "messages_insert_policy" ON public.messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Allow users to update messages they sent
CREATE POLICY "messages_update_policy" ON public.messages
    FOR UPDATE
    USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

-- Allow users to delete messages they sent
CREATE POLICY "messages_delete_policy" ON public.messages
    FOR DELETE
    USING (auth.uid() = sender_id);

-- STEP 4: Fix RLS policies on chats table
DROP POLICY IF EXISTS "Users can view chats they are part of" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "chats_select_policy" ON public.chats;
DROP POLICY IF EXISTS "chats_insert_policy" ON public.chats;
DROP POLICY IF EXISTS "chats_read_policy" ON public.chats;
DROP POLICY IF EXISTS "chats_insert_policy" ON public.chats;

-- Enable RLS on chats table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Allow users to view chats they are part of
CREATE POLICY "chats_read_policy" ON public.chats
    FOR SELECT
    USING (
        auth.uid()::text = user1_id::text OR
        auth.uid()::text = user2_id::text
    );

-- Allow users to create chats
CREATE POLICY "chats_insert_policy" ON public.chats
    FOR INSERT
    WITH CHECK (
        auth.uid()::text = user1_id::text OR
        auth.uid()::text = user2_id::text
    );

-- STEP 5: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.messages TO anon, authenticated, service_role;
GRANT ALL ON public.chats TO anon, authenticated, service_role;

-- SUCCESS
SELECT
    '✅ RLS POLICIES FIXED!' as result,
    'Messages and chats now accessible to authenticated users' as message;