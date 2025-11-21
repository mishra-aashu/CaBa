import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase.js';

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Update localStorage for compatibility with existing code
        if (session?.user) {
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'User',
            email: session.user.email,
            phone: session.user.user_metadata?.phone || '',
            avatar: session.user.user_metadata?.avatar || null
          };
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
          localStorage.removeItem('currentUser');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    supabase,
    user,
    session,
    loading,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export default SupabaseContext;