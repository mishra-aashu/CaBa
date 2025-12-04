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
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Auth Debug</strong></div>
      <div>Auth User: {authUser?.name || 'None'}</div>
      <div>Auth Type: {authType || 'None'}</div>
      <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <hr style={{ margin: '5px 0' }} />
      <div>Supabase User: {supabaseUser?.id || 'None'}</div>
      <div>Supabase Loading: {supabaseLoading ? 'Yes' : 'No'}</div>
      <div>Session: {session ? 'Active' : 'None'}</div>
    </div>
  );
};

export default AuthDebug;