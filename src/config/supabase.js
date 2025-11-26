import { createClient } from '@supabase/supabase-js';

// Production Supabase configuration
const SUPABASE_URL = 'https://riekjnqllkrqkmqxmtfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZWtqbnFsbGtycWttcXhtdGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4ODc3MjQsImV4cCI6MjA3NzQ2MzcyNH0.heQABR_DZFWZ_UIb38Tzdgcy-5z5LSUob0icnqsiiQY';

// Fallback to environment variables for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and API key are required. Please check your configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;