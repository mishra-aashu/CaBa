import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import CallInterface from './CallInterface';
import IncomingCall from './IncomingCall';
import '../../styles/calls.css';

const Calls = () => {
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callType, setCallType] = useState('video');

  useEffect(() => {
    initializeCalls();
    checkPendingCall();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setupIncomingCallListener();
    }
  }, [currentUser]);

  const initializeCalls = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        alert('No user logged in');
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      setCurrentUser(user);

      await Promise.all([
        loadContacts(user),
        loadCallHistory(user)
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing calls:', error);
      setLoading(false);
    }
  };

  const loadContacts = async (user) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_user:users!contacts_contact_user_id_fkey(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const contactsData = data.map(c => c.contact_user);

      // Also load from chats
      const { data: chats } = await supabase
        .from('chats')
        .select(`
          user1:users!chats_user1_id_fkey(*),
          user2:users!chats_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (chats) {
        chats.forEach(chat => {
          const otherUser = chat.user1.id === user.id ? chat.user2 : chat.user1;
          if (!contactsData.find(c => c.id === otherUser.id)) {
            contactsData.push(otherUser);
          }
        });
      }

      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadCallHistory = async (user) => {
    try {
      const { data, error } = await supabase
        .from('call_history')
        .select(`
          *,
          caller:users!call_history_caller_id_fkey(name, avatar),
          receiver:users!call_history_receiver_id_fkey(name, avatar)
        `)
        .or(`caller_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const historyData = data.map(call => ({
        ...call,
        otherUser: call.caller_id === user.id ? call.receiver : call.caller
      }));

      setCallHistory(historyData);
    } catch (error) {
      console.error('Error loading call history:', error);
    }
  };

  const checkPendingCall = () => {
    const pendingCallStr = localStorage.getItem('pendingCall');
    if (pendingCallStr) {
      try {
        const pendingCall = JSON.parse(pendingCallStr);
        localStorage.removeItem('pendingCall');
        handleCall(pendingCall.contact, pendingCall.type);
      } catch (error) {
        console.error('Error parsing pending call:', error);
      }
    }
  };

  const setupIncomingCallListener = () => {
    if (!currentUser) return;

    const channel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_history',
          filter: `receiver_id=eq.${currentUser.id}`
        },
        (payload) => {
          const call = payload.new;
          if (call.call_status === 'initiated' && !activeCall) {
            setIncomingCall(call);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return contact.name.toLowerCase().includes(search) ||
           (contact.phone && contact.phone.includes(search));
  });

  const handleCall = (contact, type = 'video') => {
    setCallType(type);
    setActiveCall({ contact, type });
  };

  const handleAcceptCall = async (callData) => {
    setIncomingCall(null);
    setActiveCall({
      contact: { id: callData.caller_id, name: 'Caller' }, // Will be loaded in CallInterface
      type: callData.call_type,
      incoming: true,
      callId: callData.call_id,
      roomId: callData.call_id // Use call_id as room identifier
    });
  };

  const handleRejectCall = async (callId) => {
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

  const handleCallEnd = () => {
    setActiveCall(null);
    // Reload call history
    if (currentUser) {
      loadCallHistory(currentUser);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatCallTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="calls-loading">
        <div className="loading-spinner"></div>
        <p>Loading contacts...</p>
      </div>
    );
  }

  return (
    <>
      <div className="calls-container">
        <header className="app-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => window.history.back()}>
              <i className="fas fa-arrow-left"></i>
            </button>
          </div>
          <div className="header-center">
            <h1>Calls</h1>
          </div>
          <div className="header-right">
            {/* Empty for balance */}
          </div>
        </header>

        {/* Search */}
        <div className="search-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Call History */}
        {callHistory.length > 0 && (
          <div className="call-history-section">
            <h3>Recent Calls</h3>
            <div className="call-history-list">
              {callHistory.map(call => (
                <div key={call.id} className="call-history-item">
                  <div className="contact-avatar">
                    <div className="avatar-circle">
                      {call.otherUser.avatar ? (
                        <img src={call.otherUser.avatar} alt={call.otherUser.name} />
                      ) : (
                        getInitials(call.otherUser.name)
                      )}
                    </div>
                  </div>
                  <div className="call-info">
                    <h4>{call.otherUser.name}</h4>
                    <p className="call-details">
                      <i className={`fas ${call.call_type === 'video' ? 'fa-video' : 'fa-phone'}`}></i>
                      {call.call_status === 'ended' && ` • ${Math.floor(call.call_duration / 60)}:${(call.call_duration % 60).toString().padStart(2, '0')}`}
                      {call.call_status === 'missed' && ' • Missed'}
                      {call.call_status === 'rejected' && ' • Declined'}
                      {' • ' + formatCallTime(call.created_at)}
                    </p>
                  </div>
                  <button
                    className="call-btn"
                    onClick={() => handleCall(call.otherUser, call.call_type)}
                    title={`Call ${call.otherUser.name}`}
                  >
                    <i className="fas fa-phone"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="contacts-section">
          <h3>Contacts</h3>
          <div className="contacts-list">
            {filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <div key={contact.id} className="contact-item">
                  <div className="contact-avatar">
                    <div className="avatar-circle">
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.name} />
                      ) : (
                        getInitials(contact.name)
                      )}
                    </div>
                    <span className={`online-status ${contact.is_online ? 'online' : ''}`}></span>
                  </div>
                  <div className="contact-info">
                    <h4>{contact.name}</h4>
                    <p>{contact.phone || 'No phone'}</p>
                  </div>
                  <div className="call-buttons">
                    <button
                      className="call-btn voice"
                      onClick={() => handleCall(contact, 'voice')}
                      title="Voice call"
                    >
                      <i className="fas fa-phone"></i>
                    </button>
                    <button
                      className="call-btn video"
                      onClick={() => handleCall(contact, 'video')}
                      title="Video call"
                    >
                      <i className="fas fa-video"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-user-slash"></i>
                <h3>No contacts found</h3>
                <p>Add contacts to start making calls</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Call Interface */}
      {activeCall && (
        <CallInterface
          contact={activeCall.contact}
          callType={activeCall.type}
          incoming={activeCall.incoming}
          callId={activeCall.callId}
          roomId={activeCall.roomId}
          onClose={() => setActiveCall(null)}
          onCallEnd={handleCallEnd}
        />
      )}

      {/* Incoming Call */}
      {incomingCall && (
        <IncomingCall
          callData={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          onClose={() => setIncomingCall(null)}
        />
      )}
    </>
  );
};

export default Calls;