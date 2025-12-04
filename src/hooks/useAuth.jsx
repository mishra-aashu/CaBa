import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

/**
 * Universal authentication hook that handles both Supabase Auth and custom login sessions
 * Provides consistent user data across the entire application
 */
export const useAuth = () => {
  const { user: supabaseUser, loading: supabaseLoading } = useSupabase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check for Supabase Auth user first
        if (supabaseUser) {
          console.log('🔧 Supabase Auth user found:', supabaseUser.id);
          
          const userData = {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || 'User',
            email: supabaseUser.email,
            phone: supabaseUser.user_metadata?.phone || '',
            avatar: supabaseUser.user_metadata?.avatar || null,
            authType: 'supabase'
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // If no Supabase user, check for custom login session
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          try {
            const userData = JSON.parse(currentUser);
            if (userData && userData.id && userData.name) {
              console.log('🔧 Custom login session found:', userData.id);
              
              const standardizedUser = {
                id: userData.id,
                name: userData.name,
                email: userData.email || '',
                phone: userData.phone || '',
                avatar: userData.avatar || null,
                authType: 'custom'
              };
              
              setUser(standardizedUser);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing currentUser:', error);
            localStorage.removeItem('currentUser');
          }
        }

        // No valid authentication found
        console.log('🔧 No valid authentication found');
        setUser(null);
        setIsAuthenticated(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Only initialize when Supabase loading is complete
    if (!supabaseLoading) {
      initializeAuth();
    }
  }, [supabaseUser, supabaseLoading]);

  /**
   * Login function for custom authentication
   */
  const customLogin = (userData) => {
    const standardizedUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email || '',
      phone: userData.phone || '',
      avatar: userData.avatar || null,
      authType: 'custom'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(standardizedUser));
    setUser(standardizedUser);
    setIsAuthenticated(true);
  };

  /**
   * Logout function
   */
  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Check if user has admin privileges
   */
  const isAdmin = async (supabase) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data?.is_admin || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  return {
    user,
    loading: loading || supabaseLoading,
    isAuthenticated,
    customLogin,
    logout,
    isAdmin
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
 * Hook for getting current user with fallback to localStorage
 */
export const useCurrentUser = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  return {
    user,
    loading,
    isAuthenticated,
    currentUser: user // Alias for compatibility
  };
};