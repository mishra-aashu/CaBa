import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../contexts/SupabaseContext';

const AuthDebug = () => {
  const { user: authUser, loading: authLoading, authType, isAuthenticated } = useAuth();
  const { user: supabaseUser, session, loading: supabaseLoading } = useSupabase();

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: authType === 'phone' ? 'rgba(0,128,0,0.8)' : 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Auth Debug</strong></div>
      <div>✅ User: {authUser?.name || 'None'}</div>
      <div>🔐 Type: {authType || 'None'}</div>
      <div>⏳ Loading: {authLoading ? 'Yes' : 'No'}</div>
      <div>🔑 Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
      <hr style={{ margin: '5px 0' }} />
      <div>📱 SB User: {supabaseUser?.id ? 'Yes' : 'None'}</div>
      <div>⏳ SB Load: {supabaseLoading ? 'Yes' : 'No'}</div>
      <div>🎫 Session: {session ? 'Active' : 'None'}</div>
      {authType === 'phone' && <div style={{ color: '#90EE90' }}>📞 Phone Auth Active</div>}
    </div>
  );
};

export default AuthDebug;