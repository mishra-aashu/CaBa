-- ===========================================
-- MESSAGES RLS POLICY FIX
-- Fix Row Level Security to allow message access
-- ===========================================

-- STEP 1: Check current RLS policies on messages table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'messages'
ORDER BY policyname;

-- STEP 2: Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view messages they are part of" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages they send" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages they sent" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages they sent" ON public.messages;
DROP POLICY IF EXISTS "Enable read for users based on auth.uid()" ON public.messages;
DROP POLICY IF EXISTS "Enable insert for users based on auth.uid()" ON public.messages;

-- STEP 3: Enable RLS on messages table (if not already enabled)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create simple, working RLS policies for messages

-- Allow users to read messages where they are sender or receiver
CREATE POLICY "messages_select_policy" ON public.messages
    FOR SELECT 
    USING (
        auth.uid()::text = sender_id::text OR 
        auth.uid()::text = receiver_id::text OR
        chat_id IN (
            SELECT id FROM public.chats 
            WHERE user1_id::text = auth.uid()::text OR 
                  user2_id::text = auth.uid()::text
        )
    );

-- Allow users to insert messages they send
CREATE POLICY "messages_insert_policy" ON public.messages
    FOR INSERT 
    WITH CHECK (
        auth.uid()::text = sender_id::text OR
        auth.uid()::text = receiver_id::text
    );

-- Allow users to update messages they sent
CREATE POLICY "messages_update_policy" ON public.messages
    FOR UPDATE 
    USING (auth.uid()::text = sender_id::text)
    WITH CHECK (auth.uid()::text = sender_id::text);

-- Allow users to delete messages they sent
CREATE POLICY "messages_delete_policy" ON public.messages
    FOR DELETE 
    USING (auth.uid()::text = sender_id::text);

-- STEP 5: Also fix RLS policies on chats table
DROP POLICY IF EXISTS "Users can view chats they are part of" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update chats they are part of" ON public.chats;

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Allow users to view chats they are part of
CREATE POLICY "chats_select_policy" ON public.chats
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

-- Allow users to update chats they are part of
CREATE POLICY "chats_update_policy" ON public.chats
    FOR UPDATE 
    USING (
        auth.uid()::text = user1_id::text OR 
        auth.uid()::text = user2_id::text
    );

-- STEP 6: Create a test function to verify RLS is working
CREATE OR REPLACE FUNCTION public.test_messages_access()
RETURNS TABLE(current_user_id text, message_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user text;
BEGIN
    -- Get current user ID
    current_user := auth.uid()::text;
    
    IF current_user IS NULL THEN
        RETURN QUERY SELECT 'NO_AUTH'::text, 0::bigint;
        RETURN;
    END IF;
    
    -- Count messages accessible to current user
    RETURN QUERY 
    SELECT 
        current_user,
        COUNT(*)::bigint
    FROM public.messages m
    WHERE 
        auth.uid()::text = m.sender_id::text OR 
        auth.uid()::text = m.receiver_id::text OR
        m.chat_id IN (
            SELECT id FROM public.chats 
            WHERE user1_id::text = auth.uid()::text OR 
                  user2_id::text = auth.uid()::text
        );
END;
$$;

-- STEP 7: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.messages TO anon, authenticated, service_role;
GRANT ALL ON public.chats TO anon, authenticated, service_role;
GRANT ALL ON public.users TO anon, authenticated, service_role;

-- SUCCESS MESSAGE
SELECT 
    '✅ RLS POLICIES FIXED!' as status,
    'Messages and chats now accessible based on user permissions' as result,
    'Run test_messages_access() to verify' as next_step;