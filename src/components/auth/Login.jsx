import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSupabase } from '../../contexts/SupabaseContext';
import { isInWebView } from '../../utils/appDetection';
import ExternalAuthService from '../../services/externalAuthService';
import '../../styles/auth.css';

const Login = () => {
  const { signInWithGoogle } = useAuth();
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isWebView] = useState(isInWebView());



  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (isWebView) {
        // Use external browser authentication for webview apps
        const externalAuth = new ExternalAuthService(supabase);
        const result = await externalAuth.signInWithGoogleExternal();
        
        if (result.success && result.data) {
          // Authentication successful, navigate to home
          navigate('/');
        } else if (!result.success) {
          setError(result.error || 'Authentication failed');
        }
      } else {
        // Use normal Google OAuth for regular browsers
        const result = await signInWithGoogle();
        
        if (!result.success) {
          setError(result.error || 'Google sign in failed');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to your CaBa account</p>
          {isWebView && (
            <div style={{ 
              background: '#e3f2fd', 
              padding: '10px', 
              borderRadius: '8px', 
              marginTop: '10px',
              fontSize: '14px',
              color: '#1976d2'
            }}>
              📱 App Mode: Authentication will open in your browser
            </div>
          )}
        </div>

        <div className="auth-form">
          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <button
            type="button"
            className="btn btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Signup Link */}
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
