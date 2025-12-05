import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import ExternalAuthService from '../../services/externalAuthService';

const ExternalAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { supabase } = useSupabase();
  const [status, setStatus] = useState('processing');

  const sessionId = searchParams.get('session');

  useEffect(() => {
    if (!sessionId || !supabase) return;

    const processCallback = async () => {
      try {
        setStatus('processing');
        
        // Get the authenticated session
        const { data: { user, session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setStatus('error');
          return;
        }

        if (user && session) {
          // Check if user exists in database
          const { data: existingUser, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

          let userData;
          
          if (dbError && dbError.code === 'PGRST116') {
            // Create new user
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email.split('@')[0],
                phone: user.user_metadata?.phone || null,
                password: null,
                auth_password: null,
                email_confirmed_at: new Date().toISOString(),
                is_online: true,
                created_at: new Date().toISOString(),
                last_seen: new Date().toISOString(),
                provider: 'google'
              }])
              .select()
              .single();

            if (createError) {
              console.error('Error creating user:', createError);
              setStatus('error');
              return;
            }
            userData = newUser;
          } else if (existingUser) {
            // Update existing user
            await supabase
              .from('users')
              .update({
                is_online: true,
                last_seen: new Date().toISOString()
              })
              .eq('id', existingUser.id);
            userData = existingUser;
          }

          // Store auth result for the app to pick up
          const authService = new ExternalAuthService(supabase);
          const stored = authService.storeAuthResult(sessionId, userData, session);
          
          if (stored) {
            setStatus('success');
            
            // Auto-close window after 3 seconds
            setTimeout(() => {
              window.close();
            }, 3000);
          } else {
            setStatus('error');
          }
        } else {
          setStatus('error');
        }
        
      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
      }
    };

    processCallback();
  }, [sessionId, supabase]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🎉 Authentication Complete!</h1>
        </div>

        <div className="auth-form">
          {status === 'processing' && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Processing authentication...</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>
                Success!
              </h2>
              <p>You have been successfully authenticated.</p>
              <p><strong>You can now return to the app.</strong></p>
              <small>This window will close automatically...</small>
            </div>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
              <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>
                Authentication Failed
              </h2>
              <p>There was an error processing your authentication.</p>
              <p>Please try again in the app.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.close()}
                style={{ marginTop: '20px' }}
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalAuthCallback;