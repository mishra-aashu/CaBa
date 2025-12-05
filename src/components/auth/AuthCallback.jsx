import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import MessagingLoader from '../MessagingLoader';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus('Processing Google authentication...');
        
        const result = await handleGoogleCallback();
        
        if (result.success) {
          setStatus('Login successful! Redirecting to home...');
          navigate('/');
        } else {
          setStatus('Authentication failed');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('Authentication failed: ' + error.message);
        navigate('/login');
      }
    };

    processCallback();
  }, [handleGoogleCallback, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <MessagingLoader />
      <p style={{ marginTop: '20px', color: '#666' }}>{status}</p>
    </div>
  );
};

export default AuthCallback;