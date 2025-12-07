import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from './SupabaseContext';
import AuthService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { supabase } = useSupabase();
  const [authService, setAuthService] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const initializeAuth = async () => {
      try {
        // Check for user from HTML login pages first
        const storedUser = sessionStorage.getItem('_auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // Listen for Supabase auth state changes (for OAuth)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔐 Supabase auth state changed:', event, session?.user?.id);

          if (event === 'SIGNED_IN' && session?.user) {
            try {
              // Check if user exists in database
              const { data: existingUser, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('email', session.user.email)
                .single();

              let dbUser;

              if (dbError && dbError.code === 'PGRST116') {
                // User doesn't exist, create new user
                const userData = {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
                  phone: '',
                  avatar: session.user.user_metadata?.avatar_url || null,
                  is_online: true
                };

                // Try to insert the user, but don't fail if it already exists
                try {
                  const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert([userData])
                    .select()
                    .single();

                  if (insertError) {
                    console.error('Insert error:', insertError);
                    // If insert fails due to duplicate email, try to get existing user
                    if (insertError.code === '23505') { // unique constraint violation
                      const { data: existingUser } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', session.user.email)
                        .single();

                      if (existingUser) {
                        dbUser = existingUser;
                      } else {
                        dbUser = userData; // fallback
                      }
                    } else {
                      dbUser = userData; // fallback for other errors
                    }
                  } else {
                    dbUser = newUser;
                  }
                } catch (error) {
                  console.error('User creation error:', error);
                  dbUser = userData; // fallback
                }
              } else if (existingUser) {
                // User exists, update their status
                await supabase
                  .from('users')
                  .update({
                    is_online: true,
                    last_seen: new Date().toISOString()
                  })
                  .eq('id', existingUser.id);

                dbUser = existingUser;
              } else {
                // Fallback - create user object from session
                dbUser = {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
                  phone: '',
                  avatar: session.user.user_metadata?.avatar_url || null,
                  is_online: true
                };
              }

              // Store user data and update state
              sessionStorage.setItem('_auth_user', JSON.stringify(dbUser));
              setUser(dbUser);
              setIsAuthenticated(true);

              // Redirect to main app if not already there
              if (!window.location.pathname.includes('/CaBa/') || window.location.pathname === '/CaBa/') {
                window.location.href = '/CaBa/';
              }

            } catch (error) {
              console.error('Error handling auth state change:', error);
            }
          } else if (event === 'SIGNED_OUT') {
            sessionStorage.removeItem('_auth_user');
            setUser(null);
            setIsAuthenticated(false);
          }

          setLoading(false);
        });

        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // User is already signed in, trigger the auth state change handler
          supabase.auth.onAuthStateChange('SIGNED_IN', session);
        } else {
          setLoading(false);
        }

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Auth context initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [supabase]);


  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signUpWithGoogle = async () => {
    return signInWithGoogle();
  };

  const signOut = async () => {
    try {
      // Clear session storage
      sessionStorage.removeItem('_auth_user');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear auth service
      if (authService) {
        authService.signOut();
      }
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to HTML login
      window.location.href = '/CaBa/login.html';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signInWithPhone: (phone, password) => authService?.authenticateWithPhone(phone, password),
    signUpWithPhone: (phone, password, name, email) => authService?.signUpWithPhone(phone, password, name, email),
    signInWithGoogle,
    signUpWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
