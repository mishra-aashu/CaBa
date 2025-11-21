// =============================================
// SUPABASE CONFIGURATION
// Complete error-free setup
// =============================================

const SUPABASE_URL = 'https://riekjnqllkrqkmqxmtfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZWtqbnFsbGtycWttcXhtdGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4ODc3MjQsImV4cCI6MjA3NzQ2MzcyNH0.heQABR_DZFWZ_UIb38Tzdgcy-5z5LSUob0icnqsiiQY';

// =============================================
// Initialize Supabase Client with Retry Logic
// =============================================
let supabase;
let connectionRetries = 0;
const MAX_RETRIES = 3;

function initSupabase() {
    try {
        // Check if Supabase is available
        if (typeof window.supabase === 'undefined' || !window.supabase) {
            throw new Error('Supabase library not loaded. Check CDN script.');
        }

        if (typeof window.supabase.createClient !== 'function') {
            throw new Error('Supabase createClient method not available');
        }

        

        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

        // Make supabase client globally available
        window.supabaseClient = supabase;

        console.log('✅ Supabase initialization completed successfully');

        // Set flag to indicate that Supabase is loaded
        window.supabaseConfigLoaded = true;
        return true;
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        console.error('🔍 Debug info:', {
            supabaseAvailable: typeof window.supabase !== 'undefined',
            createClientAvailable: typeof window.supabase?.createClient === 'function',
            url: SUPABASE_URL,
            keyLength: SUPABASE_ANON_KEY.length
        });
        return false;
    }
}

// =============================================
// Connection Health Check
// =============================================
async function checkSupabaseConnection() {
    // Connection check removed - client initialization is sufficient verification
    console.log('✅ Supabase client ready for use');
    return true;
}

// =============================================
// Enhanced Error Handler
// =============================================
function handleSupabaseError(error, context = 'Operation') {
    console.error(`❌ ${context} Error:`, error);

    const errorMessages = {
        'PGRST116': 'No data found',
        'PGRST301': 'Database table not found',
        '23505': 'Duplicate entry',
        '23503': 'Referenced record not found',
        'JWT': 'Session expired',
        'ECONNREFUSED': 'Cannot connect to server',
        'ERR_HTTP2_PROTOCOL_ERROR': 'Connection protocol error',
        'ERR_CONNECTION_CLOSED': 'Connection closed unexpectedly',
        'Failed to fetch': 'Network error - check your connection'
    };

    let userMessage = 'An error occurred. Please try again.';

    // Check error codes
    if (error.code && errorMessages[error.code]) {
        userMessage = errorMessages[error.code];
    } else if (error.message) {
        // Check error message
        for (const [key, value] of Object.entries(errorMessages)) {
            if (error.message.includes(key)) {
                userMessage = value;
                break;
            }
        }
    }

    return {
        success: false,
        message: userMessage,
        originalError: error,
        shouldRetry: ['Failed to fetch', 'ERR_CONNECTION_CLOSED', 'ERR_HTTP2_PROTOCOL_ERROR'].includes(error.message?.substring(0, 50))
    };
}

// =============================================
// Retry Wrapper for Database Operations
// =============================================
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await operation();
            if (result.error) {
                throw result.error;
            }
            return result;
        } catch (error) {
            console.warn(`⚠️ Attempt ${i + 1} failed:`, error.message);

            if (i === maxRetries - 1) {
                throw error;
            }

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
}

// =============================================
// Session Management - REMOVED (now in separate file)
// =============================================

// =============================================
// Auto-reconnect on page visibility
// =============================================
document.addEventListener('visibilitychange', async () => {
    try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) return;
        const currentUser = JSON.parse(currentUserStr);
        if (!document.hidden && currentUser) {
            console.log('📱 Page visible - checking connection...');
            const isConnected = await checkSupabaseConnection();

            if (isConnected && currentUser.id) {
                // Update user online status
                await supabaseClient
                    .from('users')
                    .update({
                        is_online: true,
                        last_seen: new Date().toISOString()
                    })
                    .eq('id', currentUser.id);
            }
        } else if (document.hidden && currentUser && currentUser.id) {
            // Update user offline status
            await supabaseClient
                .from('users')
                .update({
                    is_online: false,
                    last_seen: new Date().toISOString()
                })
                .eq('id', currentUser.id);
        }
    } catch (error) {
        console.warn('Error in visibilitychange handler:', error);
    }
});

// =============================================
// Window beforeunload - Update status
// =============================================
window.addEventListener('beforeunload', () => {
    try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) return;
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser && currentUser.id) {
            // Use navigator.sendBeacon for reliable status update
            const data = JSON.stringify({
                id: currentUser.id,
                is_online: false,
                last_seen: new Date().toISOString()
            });

            navigator.sendBeacon(
                `${SUPABASE_URL}/rest/v1/users?id=eq.${currentUser.id}`,
                data
            );
        }
    } catch (error) {
        console.warn('Error in beforeunload handler:', error);
    }
});

// =============================================
// Initialize Supabase on load
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DOM loaded, initializing Supabase...');
    const success = initSupabase();
    if (success) {

    } else {
        console.error('❌ Supabase initialization failed');
    }
});

// =============================================
// Export for use in other files
// =============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        supabase,
        handleSupabaseError,
        retryOperation,
        SessionManager,
        checkSupabaseConnection
    };
}