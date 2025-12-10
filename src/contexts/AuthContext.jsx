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
        console.log('🔐 [AUTH] Initializing authentication...');

        // Check for user from HTML login pages first
        const storedUser = sessionStorage.getItem('_auth_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('🔐 [AUTH] Found user in sessionStorage:', userData.email);
            setUser(userData);
            setIsAuthenticated(true);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('🔐 [AUTH] Error parsing sessionStorage user:', parseError);
            sessionStorage.removeItem('_auth_user');
          }
        }

        // Listen for Supabase auth state changes with better error handling
        let subscription = null;
        try {
          const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔐 [AUTH] Auth state changed:', event, session?.user?.email);

            try {
              if (event === 'SIGNED_IN' && session?.user) {
                // User is signed in, but user creation is handled by callback page
                // Just update the UI state
                const userData = {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
                  phone: '',
                  avatar: session.user.user_metadata?.avatar_url || null,
                  is_online: true
                };

                console.log('🔐 [AUTH] User signed in:', userData.email);
                setUser(userData);
                setIsAuthenticated(true);
              } else if (event === 'SIGNED_OUT') {
                console.log('🔐 [AUTH] User signed out');
                sessionStorage.removeItem('_auth_user');
                setUser(null);
                setIsAuthenticated(false);
              } else if (event === 'TOKEN_REFRESHED') {
                console.log('🔐 [AUTH] Token refreshed');
              }
            } catch (eventError) {
              console.error('🔐 [AUTH] Error handling auth event:', eventError);
            }

            setLoading(false);
          });

          subscription = authSubscription;
        } catch (subscriptionError) {
          console.error('🔐 [AUTH] Error setting up auth subscription:', subscriptionError);
        }

        // Check current session with error handling
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('🔐 [AUTH] Session error:', sessionError.message);
          } else if (session?.user) {
            // User is already signed in
            const userData = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
              phone: '',
              avatar: session.user.user_metadata?.avatar_url || null,
              is_online: true
            };

            console.log('🔐 [AUTH] Found existing session:', userData.email);
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch (sessionCheckError) {
          console.error('🔐 [AUTH] Error checking session:', sessionCheckError);
        }

        setLoading(false);

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('🔐 [AUTH] Auth context initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [supabase]);


  const signInWithGoogle = async () => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return { success: false, error: 'Not in browser environment' };
      }

      // Check network connectivity
      if (!navigator.onLine) {
        return { success: false, error: 'No internet connection' };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth-callback.html',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error: error.message || 'Google sign-in failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Google sign-in exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
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
