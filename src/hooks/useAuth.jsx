import { useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * Clean authentication hook using unified auth service
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authType, setAuthType] = useState(null);

  useEffect(() => {
    // Initialize auth service
    const initAuth = async () => {
      try {
        const userData = await authService.initialize();
        setUser(userData);
        setAuthType(authService.authType);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setAuthType(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const unsubscribe = authService.addListener((userData, type) => {
      setUser(userData);
      setAuthType(type);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (method, credentials) => {
    setLoading(true);
    try {
      let userData;
      if (method === 'phone') {
        userData = await authService.loginWithPhone(credentials.phone, credentials.password);
      } else if (method === 'google') {
        userData = await authService.loginWithGoogle();
      }
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    authType,
    isAuthenticated: !!user,
    login,
    logout
  };
};

/**
 * Higher-order component for protecting routes
 */
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { user, loading, isAuthenticated } = useAuth();
    
    if (loading) {
      return (
        <div className="auth-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} user={user} />;
  };
};

/**
 * Hook for getting current user
 */
export const useCurrentUser = () => {
  const { user, loading, isAuthenticated, authType } = useAuth();
  
  return {
    user,
    loading,
    isAuthenticated,
    authType,
    currentUser: user // Alias for compatibility
  };
};