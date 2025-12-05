-- ===========================================
-- SIMPLEST AUTHENTICATION FIX
-- Minimal changes, maximum compatibility
-- ===========================================

-- STEP 1: BACKUP (Safety First!)
CREATE TABLE IF NOT EXISTS public.users_backup AS SELECT * FROM public.users;

-- STEP 2: Add missing columns only
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'phone';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();

-- STEP 3: Update existing users (set default auth type)
UPDATE public.users SET auth_provider = 'phone' WHERE auth_provider IS NULL;

-- STEP 4: Add indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON public.users(auth_provider);

-- STEP 5: Add constraint safely
DO $$
BEGIN
    -- Drop if exists, add if not exists
    BEGIN
        ALTER TABLE public.users DROP CONSTRAINT users_auth_provider_check;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore if constraint doesn't exist
        NULL;
    END;
    
    ALTER TABLE public.users ADD CONSTRAINT users_auth_provider_check 
        CHECK (auth_provider IN ('phone', 'google'));
END $$;

-- STEP 6: Create authentication function (safe)
CREATE OR REPLACE FUNCTION public.find_user_by_phone(p_phone text)
RETURNS TABLE(id uuid, name text, phone text, email text, password text, auth_provider text, is_admin boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.phone, u.email, u.password, u.auth_provider, u.is_admin
    FROM public.users u
    WHERE u.phone = p_phone
    LIMIT 1;
END;
$$;

-- STEP 7: Update user status function
CREATE OR REPLACE FUNCTION public.update_user_status(p_user_id uuid, p_is_online boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users 
    SET 
        is_online = p_is_online,
        last_seen = CASE WHEN NOT p_is_online THEN now() ELSE last_seen END,
        updated_at = now()
    WHERE id = p_user_id;
END;
$$;

-- STEP 8: Handle Google OAuth users (safe version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_name text;
    user_email text;
    user_phone text;
BEGIN
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        COALESCE(NEW.email, 'User')
    );
    user_email := NEW.email;
    user_phone := NEW.raw_user_meta_data->>'phone';
    
    -- Insert with proper type handling
    INSERT INTO public.users (
        id, name, email, phone, auth_provider, is_online, last_seen, created_at, updated_at
    ) VALUES (
        NEW.id::text, user_name, user_email, user_phone, 'google', true, now(), now(), now()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        auth_provider = 'google',
        is_online = true,
        last_seen = now(),
        updated_at = now();
    
    RETURN NEW;
END;
$$;

-- STEP 9: Enable auto user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SUCCESS MESSAGE
SELECT 
    '✅ AUTHENTICATION FIXED!' as result,
    'Users backup: ' || (SELECT COUNT(*) FROM public.users_backup) as backed_up_users,
    'Current users: ' || (SELECT COUNT(*) FROM public.users) as total_users,
    'Phone login & Google OAuth enabled' as features;