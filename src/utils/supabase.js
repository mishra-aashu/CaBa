import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://riekjnqllkrqkmqxmtfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZWtqbnFsbGtycWttcXhtdGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4ODc3MjQsImV4cCI6MjA3NzQ2MzcyNH0.heQABR_DZFWZ_UIb38Tzdgcy-5z5LSUob0icnqsiiQY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;