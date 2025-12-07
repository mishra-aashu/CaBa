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

        const service = new AuthService(supabase);
        await service.initialize();
        
        setAuthService(service);

        const currentUser = service.getUser();
        setUser(currentUser);
        setIsAuthenticated(service.isAuthenticated());

        const unsubscribe = service.onAuthStateChange(({ user, isAuthenticated }) => {
          console.log('🔐 Auth state changed: SIGNED_IN (phone)', { user: user?.id, isAuthenticated });
          setUser(user);
          setIsAuthenticated(isAuthenticated);
        });

        setLoading(false);

        return () => {
          unsubscribe();
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
