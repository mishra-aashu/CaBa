import { isInWebView, generateSessionId } from '../utils/appDetection';

class ExternalAuthService {
  constructor(supabase) {
    this.supabase = supabase;
    this.authWindow = null;
    this.sessionId = null;
    this.pollInterval = null;
  }

  // Open external browser for Google OAuth
  async signInWithGoogleExternal() {
    try {
      if (!isInWebView()) {
        // If not in webview, use normal OAuth
        return this.normalGoogleAuth();
      }

      // Generate unique session ID
      this.sessionId = generateSessionId();
      
      // Create external auth URL (HTML version)
      const authUrl = `${window.location.origin}/CaBa/external-login.html?session=${this.sessionId}&action=login`;
      
      console.log('🔗 Attempting to open external HTML login:', authUrl);
      
      // Try multiple methods to open external browser
      let opened = false;
      
      // Method 1: window.open with _system target (for mobile apps)
      try {
        this.authWindow = window.open(authUrl, '_system');
        if (this.authWindow) {
          opened = true;
          console.log('✅ Opened with _system target');
        }
      } catch (e) {
        console.log('❌ _system target failed:', e.message);
      }
      
      // Method 2: window.open with _blank
      if (!opened) {
        try {
          this.authWindow = window.open(authUrl, '_blank', 'noopener,noreferrer');
          if (this.authWindow) {
            opened = true;
            console.log('✅ Opened with _blank target');
          }
        } catch (e) {
          console.log('❌ _blank target failed:', e.message);
        }
      }
      
      // Method 3: Create invisible link and click it
      if (!opened) {
        try {
          const link = document.createElement('a');
          link.href = authUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          opened = true;
          console.log('✅ Opened with programmatic link click');
        } catch (e) {
          console.log('❌ Link click failed:', e.message);
        }
      }
      
      // Method 4: Direct window.location (last resort)
      if (!opened) {
        console.log('🔄 All methods failed, redirecting current window');
        window.location.href = authUrl;
        return { success: true, external: true, redirected: true };
      }

      // Start polling for auth completion
      return this.pollForAuthCompletion();
      
    } catch (error) {
      console.error('External auth error:', error);
      return { success: false, error: error.message };
    }
  }

  // Normal Google OAuth for regular browsers
  async normalGoogleAuth() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/CaBa/`
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Poll for authentication completion
  pollForAuthCompletion() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes timeout

      this.pollInterval = setInterval(async () => {
        attempts++;
        
        try {
          // Check if auth completed by looking for session data
          const authData = localStorage.getItem(`external_auth_${this.sessionId}`);
          
          if (authData) {
            const { user, session } = JSON.parse(authData);
            
            // Clean up
            localStorage.removeItem(`external_auth_${this.sessionId}`);
            clearInterval(this.pollInterval);
            
            if (this.authWindow) {
              this.authWindow.close();
            }
            
            resolve({ success: true, data: { user, session } });
            return;
          }
          
          // Check if window was closed manually
          if (this.authWindow && this.authWindow.closed) {
            clearInterval(this.pollInterval);
            resolve({ success: false, error: 'Authentication cancelled' });
            return;
          }
          
          // Timeout check
          if (attempts >= maxAttempts) {
            clearInterval(this.pollInterval);
            if (this.authWindow) {
              this.authWindow.close();
            }
            resolve({ success: false, error: 'Authentication timeout' });
          }
          
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000); // Check every 5 seconds
    });
  }

  // Store auth result for polling
  storeAuthResult(sessionId, userData, sessionData) {
    try {
      const authData = {
        user: userData,
        session: sessionData,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`external_auth_${sessionId}`, JSON.stringify(authData));
      return true;
    } catch (error) {
      console.error('Error storing auth result:', error);
      return false;
    }
  }

  // Clean up
  cleanup() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.authWindow) {
      this.authWindow.close();
    }
  }
}

export default ExternalAuthService;