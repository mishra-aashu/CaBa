import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const AuthStatus = () => {
  const { user, loading, authType, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '5px', margin: '10px 0' }}>
        <span>🔄 Loading authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '10px', background: '#ffe6e6', borderRadius: '5px', margin: '10px 0' }}>
        <span>❌ Not authenticated</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px', background: '#e6ffe6', borderRadius: '5px', margin: '10px 0' }}>
      <div>✅ Authenticated as: <strong>{user.name}</strong></div>
      <div>📱 Phone: {user.phone || 'Not set'}</div>
      <div>📧 Email: {user.email || 'Not set'}</div>
      <div>🔐 Auth Type: <span style={{ 
        background: authType === 'google' ? '#4285f4' : '#28a745', 
        color: 'white', 
        padding: '2px 8px', 
        borderRadius: '3px',
        fontSize: '12px'
      }}>
        {authType === 'google' ? 'Google OAuth' : 'Phone Login'}
      </span></div>
    </div>
  );
};

export default AuthStatus;