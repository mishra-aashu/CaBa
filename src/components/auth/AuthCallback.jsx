import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await handleGoogleCallback();
        
        if (result.success) {
          // Redirect to home page on successful authentication
          navigate('/', { replace: true });
        } else {
          setError(result.error || 'Authentication failed');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [navigate, handleGoogleCallback]);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Authenticating...</h1>
            <p>Please wait while we complete your Google sign-in</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Authentication Error</h1>
            <p>{error}</p>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;