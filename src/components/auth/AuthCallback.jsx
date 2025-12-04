import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import authService from '../../services/authService';
import MessagingLoader from '../MessagingLoader';

const AuthCallback = () => {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get session from URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('Authentication failed');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!session?.user) {
          setStatus('No user session found');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const user = session.user;
        setStatus('Verifying user in database...');

        // Check if user exists in database
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (dbError && dbError.code !== 'PGRST116') {
          console.error('Database error:', dbError);
          setStatus('Database verification failed');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!dbUser) {
          // User not in database, redirect to complete profile
          setStatus('Completing profile setup...');
          setTimeout(() => navigate('/'), 100);
          return;
        }

        // User exists in database, complete login
        setStatus('Login successful! Redirecting...');
        
        // Let authService handle the user
        await authService.handleSupabaseUser(user);

        setTimeout(() => navigate('/'), 1000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('Authentication failed');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleAuthCallback();
  }, [supabase, navigate]);

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