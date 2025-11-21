import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/calls.css';

const Calls = () => {
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeCalls();
  }, []);

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

      await loadContacts(user);
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

  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return contact.name.toLowerCase().includes(search) ||
           (contact.phone && contact.phone.includes(search));
  });

  const handleCall = (contact) => {
    alert(`Calling ${contact.name} - WebRTC implementation needed`);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

      {/* Contacts List */}
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
              <button
                className="call-btn"
                onClick={() => handleCall(contact)}
                title={`Call ${contact.name}`}
              >
                <i className="fas fa-phone"></i>
              </button>
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
  );
};

export default Calls;