import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import ExternalAuthService from '../../services/externalAuthService';

const ExternalAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session');
  const action = searchParams.get('action');

  useEffect(() => {
    if (!sessionId || !supabase) return;

    const handleExternalAuth = async () => {
      try {
        setStatus('authenticating');
        
        // Perform Google OAuth in this browser window
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/CaBa/external-auth-callback?session=${sessionId}`
          }
        });

        if (error) {
          setError(error.message);
          setStatus('error');
        }
        
      } catch (error) {
        console.error('External auth error:', error);
        setError(error.message);
        setStatus('error');
      }
    };

    handleExternalAuth();
  }, [sessionId, supabase]);

  const handleRetry = () => {
    setError('');
    setStatus('initializing');
    window.location.reload();
  };

  const handleCancel = () => {
    // Signal cancellation to the app
    if (sessionId) {
      localStorage.setItem(`external_auth_${sessionId}`, JSON.stringify({
        cancelled: true,
        timestamp: Date.now()
      }));
    }
    window.close();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🔐 External Authentication</h1>
          <p>Authenticating with Google in your browser...</p>
        </div>

        <div className="auth-form">
          {status === 'initializing' && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Setting up authentication...</p>
            </div>
          )}

          {status === 'authenticating' && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Redirecting to Google...</p>
              <small>Please complete the authentication process</small>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="error-message">
                Authentication Error: {error}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn btn-primary" onClick={handleRetry}>
                  Try Again
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="auth-footer" style={{ marginTop: '30px' }}>
            <p><strong>Note:</strong> This window will close automatically after authentication</p>
            <small>You can safely close this window if authentication is complete</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalAuth;