# Database Check Guide 🔍

## How to Check Your Supabase Database

### Option 1: Run SQL Script in Supabase Dashboard (RECOMMENDED)

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to "SQL Editor"

2. **Run Database Audit Script**
   - Copy the entire content from `DATABASE_AUDIT.sql`
   - Paste it in the SQL Editor
   - Click "Run" button

3. **Review Results**
   - The script will show you exactly what tables exist
   - Check if your `users` table has the correct structure
   - Verify if `auth.users` table exists

### Option 2: Browser Console Test

1. **Open your React app** (with Supabase connected)
2. **Open Browser Console** (F12 → Console)
3. **Run this JavaScript code:**

```javascript
// Test Supabase Connection and Basic Info
const { data, error } = await supabase
  .from('users')
  .select('id, name, phone, email, auth_provider')
  .limit(5);

if (error) {
  console.error('❌ Database Error:', error);
} else {
  console.log('✅ Database Connection OK');
  console.log('📊 Sample Users:', data);
}

// Check if auth.users exists (for OAuth)
const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
if (authError) {
  console.log('⚠️  Auth API Error:', authError.message);
} else {
  console.log('✅ Auth API Working:', authUsers.users?.length || 0, 'users');
}
```

### Option 3: Manual Check in Supabase Dashboard

1. **Go to Table Editor**
   - In Supabase Dashboard → "Table Editor"
   - Check if these tables exist:

2. **Required Tables Check:**
   ```
   ✅ public.users
   ✅ public.login_history
   ✅ public.messages
   ✅ public.chats
   ✅ public.support_messages
   ```

3. **Check users table structure:**
   - Click on `users` table
   - Click "Columns" tab
   - Verify these columns exist:
     - `id` (should be UUID type)
     - `name`
     - `phone`
     - `email`
     - `password` ⚠️ (This is missing in current schema!)
     - `auth_provider` ⚠️ (This is missing in current schema!)
     - `is_admin`
     - `is_online`

### Critical Issues to Look For:

❌ **If users table has NO password column** → Phone login won't work
❌ **If users.id is TEXT instead of UUID** → Google OAuth won't work
❌ **If auth_provider column doesn't exist** → Auth type confusion
❌ **If auth.users table missing** → Google OAuth won't work

### Expected vs Current Schema:

**✅ CORRECT Schema Should Have:**
```sql
-- users table
id (uuid, PRIMARY KEY)
name (text)
phone (text, UNIQUE)
email (text, UNIQUE) 
password (text)           -- Missing!
auth_provider (text)      -- Missing!
is_admin (boolean)
is_online (boolean)
last_seen (timestamp)
```

**❌ CURRENT Schema Problems:**
- `id` is TEXT instead of UUID
- NO `password` column for phone login
- NO `auth_provider` column
- Missing proper auth integration

### Next Steps Based on Your Findings:

**If Schema is BROKEN:**
1. Run `SCHEMA_AUTH_FIX.sql` in Supabase SQL Editor
2. This will fix all authentication issues

**If Schema is OK:**
1. The issue is in React code, not database
2. We'll fix the authentication logic

### Quick Fix Commands (Copy-Paste):

**If you want to fix everything at once, run this in Supabase SQL Editor:**

```sql
-- Quick Schema Fix
ALTER TABLE public.users ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'phone';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();
```

Then test your app again!

### Report Your Findings:

Please run the DATABASE_AUDIT.sql script and tell me:

1. **How many tables** do you see in the public schema?
2. **What columns** does your `users` table have?
3. **Does `auth.users` table exist?**
4. **Any errors** when running the audit script?

This will help me give you the exact fix needed! 🚀