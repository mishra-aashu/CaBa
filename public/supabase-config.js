// Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://riekjnqllkrqkmqxmtfu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZWtqbnFsbGtycWttcXhtdGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4ODc3MjQsImV4cCI6MjA3NzQ2MzcyNH0.heQABR_DZFWZ_UIb38Tzdgcy-5z5LSUob0icnqsiiQY'
};

// Initialize Supabase client
const { createClient } = supabase;
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Make it available globally
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.supabase = supabase;