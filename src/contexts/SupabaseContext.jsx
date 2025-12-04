import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase.js';
import { createCustomSupabaseClient } from '../utils/customSupabase.js';
import IncomingCall from '../components/calls/IncomingCall';
import authService from '../services/authService';
import phoneAuth from '../utils/phoneAuth';

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
        if (authService.authType === 'phone') {
          // Create mock session for phone users
          const mockSession = {
            user: {
              id: userData.id,
              email: userData.email || `${userData.phone}@phone.local`,
              user_metadata: {
                name: userData.name,
                phone: userData.phone,
                avatar: userData.avatar
              }
            }
          };
          setSession(mockSession);
          setUser(mockSession.user);
        } else {
          // Get real Supabase session for Google auth
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for Supabase auth changes (Google OAuth only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only handle real Supabase sessions (Google OAuth)
        if (event === 'SIGNED_IN' && session?.user && !session.access_token?.startsWith('phone_')) {
          console.log('Google auth state changed:', event);
          await authService.handleSupabaseUser(session.user);
          setSession(session);
          setUser(session.user);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    );



    return () => {
      subscription.unsubscribe();
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