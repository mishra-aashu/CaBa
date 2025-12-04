import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase.js';
import { createCustomSupabaseClient } from '../utils/customSupabase.js';
import IncomingCall from '../components/calls/IncomingCall';
import authService from '../services/authService';

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingCallChannel, setIncomingCallChannel] = useState(null);

  useEffect(() => {
    // Initialize auth service
    const initAuth = async () => {
      const userData = await authService.initialize();
      if (userData) {
        // Get Supabase session for both auth types
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for Supabase auth changes (both Google and Phone)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Handle both Google OAuth and Phone login
          if (session.user.email && !session.user.email.includes('@phone.local')) {
            // Google OAuth user
            await authService.handleSupabaseUser(session.user);
          }
          setSession(session);
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Listen for custom auth events (phone login)
    const handleCustomAuth = (event) => {
      const { event: authEvent, session } = event.detail;
      if (authEvent === 'SIGNED_IN') {
        setSession(session);
        setUser(session.user);
      } else if (authEvent === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      }
    };

    window.addEventListener('supabase-auth-change', handleCustomAuth);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('supabase-auth-change', handleCustomAuth);
    };
  }, []);

  // Setup global incoming call listener
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if ((user || currentUser) && !incomingCallChannel) {
      const userId = user?.id || currentUser?.id;
      if (userId) {
        setupGlobalIncomingCallListener({ id: userId });
      }
    }

    return () => {
      if (incomingCallChannel) {
        supabase.removeChannel(incomingCallChannel);
        setIncomingCallChannel(null);
      }
    };
  }, [user]);

  const setupGlobalIncomingCallListener = (currentUser) => {
    console.log('📡 Setting up global incoming call listener for user:', currentUser.id);

    const channel = supabase
      .channel('global-incoming-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_history',
          filter: `receiver_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('📞 Global incoming call event received:', payload);
          const call = payload.new;
          console.log('📞 Call data:', call);
          if (call.call_status === 'initiated') {
            console.log('📞 Showing global incoming call popup for call:', call.id);
            setIncomingCall(call);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Global incoming call listener status:', status);
        if (status === 'SUBSCRIBED') {
          setIncomingCallChannel(channel);
        }
      });
  };

  const handleAcceptCall = async (callData) => {
    console.log('📞 Accepting call:', callData.id);
    setIncomingCall(null);

    // Navigate to calls page with call data
    window.location.href = `#/calls?incoming=true&callId=${callData.call_id}&roomId=${callData.call_id}&callType=${callData.call_type}`;
  };

  const handleRejectCall = async (callId) => {
    console.log('📞 Rejecting call:', callId);
    try {
      if (window.WebRTCCall) {
        const callInstance = new window.WebRTCCall();
        await callInstance.rejectCall(callId);
      }
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
    setIncomingCall(null);
  };

  const value = {
    supabase: createCustomSupabaseClient(),
    user,
    session,
    loading,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}

      {/* Global Incoming Call Overlay */}
      {incomingCall && (
        <IncomingCall
          callData={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          onClose={() => setIncomingCall(null)}
        />
      )}
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