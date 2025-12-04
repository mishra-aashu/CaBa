import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../hooks/useAuth';
import MessagingLoader from '../MessagingLoader';

const AuthCallback = () => {
  const { supabase } = useSupabase();
  const { customLogin } = useAuth();
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
        
        const userData = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          avatar: dbUser.avatar,
          authType: 'google',
          loginTime: new Date().toISOString()
        };

        // Create session
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('authToken', dbUser.id);
        localStorage.setItem('sessionPermanent', 'true');
        
        customLogin(userData);

        // Update user online status
        await supabase
          .from('users')
          .update({
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', dbUser.id);

        setTimeout(() => navigate('/'), 1000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('Authentication failed');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleAuthCallback();
  }, [supabase, navigate, customLogin]);

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