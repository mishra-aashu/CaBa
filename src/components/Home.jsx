import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { useTheme } from '../contexts/ThemeContext';
import { MessageCircle, Phone, Newspaper, Settings, User, Search, MoreVertical, Plus, Bell, Info, HelpCircle, LogOut, Crown, X, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import DropdownMenu from './common/DropdownMenu';
import Modal from './common/Modal';
import Chat from './chat/Chat';
import MessagingLoader from './MessagingLoader';
import { useChatListRealtime } from '../hooks/useChatListRealtime';
import '../styles/home.css';

const Home = () => {
  const { supabase, user, loading: authLoading } = useSupabase();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { chatId, otherUserId } = useParams();

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showSelectContact, setShowSelectContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [savedContacts, setSavedContacts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Realtime chat list
  const { chats, setChats, loading: chatsLoading } = useChatListRealtime(currentUser?.id);

  // DP options for avatar display
  const baseUrl = import.meta.env.BASE_URL || '/';
  const dpOptions = [
    { "id": 1, "path": `${baseUrl}assets/images/dp-options/00701602b0eac0390b3107b9e2a665e0.jpg` },
    { "id": 2, "path": `${baseUrl}assets/images/dp-options/1691130988954.jpg` },
    { "id": 3, "path": `${baseUrl}assets/images/dp-options/aesthetic-cartoon-funny-dp-for-instagram.webp` },
    { "id": 4, "path": `${baseUrl}assets/images/dp-options/boy-cartoon-dp-with-hoodie.webp` },
    { "id": 5, "path": `${baseUrl}assets/images/dp-options/download (1).jpg` },
    { "id": 6, "path": `${baseUrl}assets/images/dp-options/download.jpg` },
    { "id": 7, "path": `${baseUrl}assets/images/dp-options/funny-profile-picture-wd195eo9rpjy7ax1.jpg` },
    { "id": 8, "path": `${baseUrl}assets/images/dp-options/funny-whatsapp-dp-for-girls.webp` },
    { "id": 9, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575118_y.jpg` },
    { "id": 10, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575119_y.jpg` },
    { "id": 11, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575120_y.jpg` },
    { "id": 12, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575121_y.jpg` },
    { "id": 13, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575122_y.jpg` },
    { "id": 14, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575123_y.jpg` },
    { "id": 15, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575124_y.jpg` },
    { "id": 16, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575125_y.jpg` },
    { "id": 17, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575126_y.jpg` },
    { "id": 18, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575127_y.jpg` },
    { "id": 19, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267708_w.jpg` },
    { "id": 20, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267709_w.jpg` },
    { "id": 21, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267710_w.jpg` },
    { "id": 22, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267711_w.jpg` },
    { "id": 23, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267712_w.jpg` },
    { "id": 24, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267713_w.jpg` },
    { "id": 25, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267714_w.jpg` },
    { "id": 26, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267715_w.jpg` },
    { "id": 27, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267716_w.jpg` },
    { "id": 28, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267717_w.jpg` }
  ];

  useEffect(() => {
    if (!authLoading) {
      initializeHome();
    }
  }, [authLoading, user]);

  // Reload saved contacts when modal opens
  useEffect(() => {
    if (showNewContactModal && currentUser) {
      loadSavedContacts();
    }
  }, [showNewContactModal]);

  const initializeHome = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user exists in database
      const { data: dbUsers, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id);

      if (dbError) {
        console.error('Database error checking user:', dbError);
        setLoading(false);
        return;
      }

      if (!dbUsers || dbUsers.length === 0) {
        console.log('User authenticated but not in database - showing phone modal');
        // User authenticated but not in database - needs phone collection
        setShowPhoneModal(true);
        setLoading(false);
        return;
      }

      const dbUser = dbUsers[0];

      // User exists in database
      const currentUserData = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        avatar: dbUser.avatar
      };

      setCurrentUser(currentUserData);

      // Update localStorage for compatibility
      localStorage.setItem('currentUser', JSON.stringify(currentUserData));

      // Check if user is admin from localStorage (role column doesn't exist in users table)
      const isAdminUser = localStorage.getItem('userRole') === 'admin';
      setIsAdmin(isAdminUser);

      // Check if user needs to complete phone number (shouldn't happen for existing users, but just in case)
      if (!dbUser.phone) {
        setShowPhoneModal(true);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error initializing home:', error);
      setLoading(false);
    }
  };


  const loadSavedContacts = async () => {
    try {
      if (!currentUser || !currentUser.id) {
        setSavedContacts([]);
        return;
      }

      console.log('Loading saved contacts for user:', currentUser.id);

      // Load contacts from Supabase database (matching HTML version)
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_user:users!contacts_contact_user_id_fkey(*)
        `)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error loading contacts from database:', error);
        setSavedContacts([]);
        return;
      }

      console.log('Loaded contacts:', data);

      // Extract contact users from the result
      const contacts = data ? data.map(c => ({
        id: c.contact_user.id,
        name: c.contact_user.name,
        phone: c.contact_user.phone,
        avatar: c.contact_user.avatar
      })) : [];

      setSavedContacts(contacts);
    } catch (error) {
      console.error('Error loading saved contacts:', error);
      setSavedContacts([]);
    }
  };

  const handleChatClick = (chat) => {
    navigate(`/chat/${chat.id}/${chat.otherUser.id}`);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    const phone = phoneNumber.trim();

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    // Password validation (required for Google OAuth users)
    if (!password || password.length < 6) {
      alert('Password is required and must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setPhoneLoading(true);

      // Check if user already exists in database
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      // Prepare user data
      const userData = {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        email: user.email,
        phone: phone,
        avatar: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString()
      };

      // Add password to user data if provided (for Google OAuth users)
      if (password && password.length > 0) {
        userData.password = password; // This will be stored in the users table
      }

      if (existingUser) {
        // Update existing user
        const { error: dbError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', user.id);

        if (dbError) {
          console.error('Database error:', dbError);
          alert('Failed to save phone number and password. Please try again.');
          return;
        }
      } else {
        // Create new user record
        const { error: dbError } = await supabase
          .from('users')
          .insert([userData]);

        if (dbError) {
          console.error('Database error:', dbError);
          alert('Failed to create account. Please try again.');
          return;
        }
      }

      // Update localStorage
      const updatedUser = {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        email: user.email,
        phone: phone,
        avatar: user.user_metadata?.avatar_url || null
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Close modal
      setShowPhoneModal(false);
      setPhoneNumber('');
      setPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error('Phone submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleAboutApp = () => {
    navigate('/about');
  };

  const handleHelp = () => {
    alert('Help Center\n\nFor support, please contact: support@caba.com');
  };

  const handleSaveContact = async () => {
    try {
      if (!contactName.trim() || !contactPhone.trim()) {
        alert('Please enter both name and phone number');
        return;
      }

      if (contactPhone.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }

      // Check if user exists with this phone number
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, name, phone')
        .eq('phone', contactPhone)
        .neq('id', currentUser.id)
        .single();

      if (userError || !existingUser) {
        alert('No user found with this phone number');
        return;
      }

      // Check if contact already exists
      const { data: existingContact, error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('contact_user_id', existingUser.id)
        .single();

      if (existingContact && !contactError) {
        alert('Contact already exists');
        setShowContactForm(false);
        setContactName('');
        setContactPhone('');
        return;
      }

      // Add contact to database
      const { error: insertError } = await supabase
        .from('contacts')
        .insert([{
          user_id: currentUser.id,
          contact_user_id: existingUser.id
        }]);

      if (insertError) {
        console.error('Error saving contact:', insertError);
        alert('Failed to save contact');
        return;
      }

      alert('Contact saved successfully!');
      setContactName('');
      setContactPhone('');
      setShowContactForm(false);

      // Reload contacts
      await loadSavedContacts();
    } catch (error) {
      console.error('Error in handleSaveContact:', error);
      alert('Failed to save contact');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const confirmed = window.confirm('Delete this contact?');
      if (!confirmed) return;

      // Delete from database
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('contact_user_id', contactId);

      if (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact');
        return;
      }

      alert('Contact deleted successfully');

      // Reload contacts
      await loadSavedContacts();
    } catch (error) {
      console.error('Error in handleDeleteContact:', error);
      alert('Failed to delete contact');
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return chat.otherUser.name.toLowerCase().includes(search) ||
        (chat.otherUser.phone && chat.otherUser.phone.includes(search));
    });
  }, [chats, searchTerm]);

  const searchUsersByPhone = async (phone) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, phone, avatar, is_online')
        .eq('phone', phone)
        .neq('id', currentUser?.id)
        .limit(1); // Since phone should be unique

      if (error) throw error;

      setSearchSuggestions(data || []);
      setShowSuggestions(data && data.length > 0);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Only search if exactly 10 digits
    if (/^\d{10}$/.test(value)) {
      searchUsersByPhone(value);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (user) => {
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.otherUser.id === user.id);
    if (existingChat) {
      handleChatClick(existingChat);
    } else {
      // Navigate to new chat
      navigate(`/chat/new/${user.id}`);
    }
    setShowSearch(false);
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const handleStartChatWithContact = (contact) => {
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.otherUser.id === contact.id);
    if (existingChat) {
      handleChatClick(existingChat);
    } else {
      // Navigate to new chat
      navigate(`/chat/new/${contact.id}`);
    }
    setShowNewContactModal(false);
    setShowSelectContact(false);
  };

  if (authLoading || loading || chatsLoading) {
    return <MessagingLoader />;
  }

  // Check if we are in a chat (for mobile view toggling)
  const isChatOpen = !!chatId && !!otherUserId;

  return (
    <div className="home-container">
      {/* Desktop Layout */}
      <div className={`desktop-layout ${isChatOpen ? 'chat-active' : ''}`}>
        {/* Sidebar */}
        <aside className={`sidebar ${isChatOpen ? 'hidden-on-mobile' : ''}`}>
          <div className="sidebar-header">
            <div className="app-logo-small">CB</div>
            <span className="app-name-small">CaBa</span>
          </div>
          <nav className="sidebar-nav">
            <button
              className="sidebar-item active"
              onClick={() => handleNavigation('/')}
            >
              <MessageCircle size={20} />
              <span className="label">Chats</span>
            </button>
            <button
              className="sidebar-item"
              onClick={() => handleNavigation('/calls')}
            >
              <Phone size={20} />
              <span className="label">Audio Call</span>
            </button>
            <button
              className="sidebar-item"
              onClick={() => handleNavigation('/news')}
            >
              <Newspaper size={20} />
              <span className="label">News</span>
            </button>
            <button
              className="sidebar-item"
              onClick={() => handleNavigation('/settings')}
            >
              <Settings size={20} />
              <span className="label">Settings</span>
            </button>
          </nav>
          <div className="sidebar-footer">
            <button
              className="user-profile-link"
              onClick={() => handleNavigation('/profile')}
            >
              <div className="sidebar-avatar">
                {currentUser?.avatar ? (
                  <img src={parseInt(currentUser.avatar) ? dpOptions.find(dp => dp.id === parseInt(currentUser.avatar))?.path : currentUser.avatar} alt={currentUser.name} />
                ) : (
                  <div>{getInitials(currentUser?.name || 'U')}</div>
                )}
              </div>
              <span className="user-name">{currentUser?.name || 'User'}</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`main-content ${isChatOpen ? 'hidden-on-mobile' : ''}`}>
          {/* Top Header */}
          <header className="top-header">
            <div className="header-left">
              <h1>Chats</h1>
            </div>
            <div className="header-right">
              <button
                className="icon-btn"
                onClick={() => setShowSearch(!showSearch)}
                title="Search"
              >
                <Search size={20} />
              </button>

              <DropdownMenu
                items={[
                  {
                    icon: <User size={16} />,
                    label: 'Profile',
                    onClick: () => handleNavigation('/profile')
                  },
                  {
                    icon: <Settings size={16} />,
                    label: 'Settings',
                    onClick: () => handleNavigation('/settings')
                  },
                  {
                    icon: <Bell size={16} />,
                    label: 'Check Reminders',
                    onClick: () => handleNavigation('/reminders')
                  },
                  ...(isAdmin ? [{
                    icon: <Crown size={16} />,
                    label: 'Admin Panel',
                    onClick: () => handleNavigation('/admin')
                  }] : []),
                  { divider: true },
                  {
                    icon: <Info size={16} />,
                    label: 'About App',
                    onClick: handleAboutApp
                  },
                  {
                    icon: <HelpCircle size={16} />,
                    label: 'Help',
                    onClick: handleHelp
                  },
                  { divider: true },
                  {
                    icon: <LogOut size={16} />,
                    label: 'Logout',
                    onClick: handleLogout
                  }
                ]}
              />
            </div>
          </header>

          {/* Search Bar */}
          {showSearch && (
            <div className="search-bar">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by phone number..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button
                className="close-search"
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm('');
                  setSearchSuggestions([]);
                  setShowSuggestions(false);
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Search Suggestions */}
          {showSearch && showSuggestions && searchSuggestions.length > 0 && (
            <div className="search-suggestions">
              {searchSuggestions.map(user => (
                <div
                  key={user.id}
                  className="search-suggestion-item"
                  onClick={() => handleSuggestionClick(user)}
                >
                  <div className="suggestion-avatar">
                    {user.avatar ? (
                      parseInt(user.avatar) ? (
                        <img src={dpOptions.find(dp => dp.id === parseInt(user.avatar))?.path || user.avatar} alt={user.name} />
                      ) : (
                        <img src={user.avatar} alt={user.name} />
                      )
                    ) : (
                      <div>{getInitials(user.name)}</div>
                    )}
                    <span className={`online-status ${user.is_online ? 'online' : ''}`}></span>
                  </div>
                  <div className="suggestion-info">
                    <div className="suggestion-name">{user.name}</div>
                    <div className="suggestion-phone">{user.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat List */}
          <div className="chat-list-container">
            <div className="chat-list">
              {filteredChats.length > 0 ? (
                filteredChats.map(chat => (
                  <div
                    key={chat.id}
                    className="chat-item"
                    onClick={() => handleChatClick(chat)}
                  >
                    <div className="chat-avatar">
                      {chat.otherUser.avatar ? (
                        <img src={parseInt(chat.otherUser.avatar) ? dpOptions.find(dp => dp.id === parseInt(chat.otherUser.avatar))?.path : chat.otherUser.avatar} alt={chat.otherUser.name} />
                      ) : (
                        <div>{getInitials(chat.otherUser.name)}</div>
                      )}
                      <span className={`online-status ${chat.otherUser.is_online ? 'online' : ''}`}></span>
                    </div>
                    <div className="chat-info">
                      <div className="chat-header">
                        <h3 className="chat-name">{chat.otherUser.name}</h3>
                        <span className="chat-time">
                          {formatTime(chat.last_message_time)}
                        </span>
                      </div>
                      <div className="chat-preview">
                        <p className="last-message">
                          {chat.last_message || 'No messages yet'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="unread-count">{chat.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div key="empty-state" className="empty-state">
                  <MessageCircle size={64} />
                  <h3>No conversations yet</h3>
                  <p>Start messaging your contacts</p>
                </div>
              )}
            </div>
          </div>

          {/* FAB */}
          <button className="fab" title="New Contact" onClick={() => setShowNewContactModal(true)}>
            <Plus size={24} />
          </button>
        </main>

        {/* Right Panel */}
        <aside className={`right-panel ${isChatOpen ? 'visible-on-mobile' : ''}`}>
          {isChatOpen ? (
            <Chat key={chatId} />
          ) : (
            <div className="chat-preview-placeholder">
              <MessageCircle size={120} />
              <h3>Welcome to CaBa</h3>
              <p>Messages are end-to-end encrypted</p>
            </div>
          )}
        </aside>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className={`bottom-nav ${isChatOpen ? 'hidden' : ''}`}>
        <button className="nav-item active" onClick={() => handleNavigation('/')}>
          <MessageCircle size={20} />
          <span className="label">Chats</span>
          <span className="badge">5</span>
        </button>
        <button className="nav-item" onClick={() => handleNavigation('/news')}>
          <Newspaper size={20} />
          <span className="label">News</span>
        </button>
        <button className="nav-item" onClick={() => handleNavigation('/calls')}>
          <Phone size={20} />
          <span className="label">Audio Call</span>
          <span className="badge">2</span>
        </button>
      </nav>

      {/* New Contact Modal */}
      <Modal
        isOpen={showNewContactModal}
        onClose={() => {
          setShowNewContactModal(false);
          setShowContactForm(false);
          setShowSelectContact(false);
          setContactName('');
          setContactPhone('');
        }}
        title={showSelectContact ? "Select Contact" : "New Contact"}
        size="medium"
      >
        <div className="new-contact-modal">
          {/* Mode Toggle */}
          <div className="modal-mode-toggle">
            <button
              className={`mode-btn ${!showSelectContact ? 'active' : ''}`}
              onClick={() => setShowSelectContact(false)}
            >
              Manage Contacts
            </button>
            <button
              className={`mode-btn ${showSelectContact ? 'active' : ''}`}
              onClick={() => setShowSelectContact(true)}
            >
              Select Contact
            </button>
          </div>

          {showSelectContact ? (
            /* Select Contact Mode */
            <div className="select-contact-section">
              <h3>Start Chat With</h3>
              <div className="saved-contacts-list">
                {savedContacts.length > 0 ? (
                  savedContacts.map(contact => (
                    <div key={contact.id} className="saved-contact-item">
                      <div className="contact-info">
                        <div className="contact-avatar">
                          {contact.avatar ? (
                            parseInt(contact.avatar) ? (
                              <img src={dpOptions.find(dp => dp.id === parseInt(contact.avatar))?.path || contact.avatar} alt={contact.name} />
                            ) : (
                              <img src={contact.avatar} alt={contact.name} />
                            )
                          ) : (
                            <div>{getInitials(contact.name)}</div>
                          )}
                        </div>
                        <div>
                          <div className="contact-name">{contact.name}</div>
                          <div className="contact-phone">{contact.phone}</div>
                        </div>
                      </div>
                      <button
                        className="start-chat-btn"
                        onClick={() => handleStartChatWithContact(contact)}
                        title="Start Chat"
                      >
                        💬 Chat
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-contacts">No saved contacts yet. Add contacts first.</p>
                )}
              </div>
            </div>
          ) : (
            /* Manage Contacts Mode */
            <>
              {/* Add New Contact Button */}
              <button
                className="add-contact-btn"
                onClick={() => setShowContactForm(!showContactForm)}
              >
                <Plus size={20} />
                Add New Contact
              </button>

              {/* Contact Form */}
              {showContactForm && (
                <div className="contact-form">
                  <input
                    type="text"
                    placeholder="Contact name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="contact-input"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number (10 digits)"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="contact-input"
                  />
                  <div className="contact-form-actions">
                    <button className="btn-primary" onClick={handleSaveContact}>
                      Save Contact
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setShowContactForm(false);
                        setContactName('');
                        setContactPhone('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Contacts List */}
              <div className="saved-contacts-section">
                <h3>Saved Contacts</h3>
                <div className="saved-contacts-list">
                  {savedContacts.length > 0 ? (
                    savedContacts.map(contact => (
                      <div key={contact.id} className="saved-contact-item">
                        <div className="contact-info">
                          <div className="contact-avatar">
                            {contact.avatar ? (
                              parseInt(contact.avatar) ? (
                                <img src={dpOptions.find(dp => dp.id === parseInt(contact.avatar))?.path || contact.avatar} alt={contact.name} />
                              ) : (
                                <img src={contact.avatar} alt={contact.name} />
                              )
                            ) : (
                              <div>{getInitials(contact.name)}</div>
                            )}
                          </div>
                          <div>
                            <div className="contact-name">{contact.name}</div>
                            <div className="contact-phone">{contact.phone}</div>
                          </div>
                        </div>
                        <button
                          className="delete-contact-btn"
                          onClick={() => handleDeleteContact(contact.id)}
                          title="Delete"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-contacts">No saved contacts yet</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showPhoneModal}
        onClose={() => {}}
        title="Complete Your Profile"
        size="medium"
      >
        <div className="phone-completion-modal">
          <div className="phone-modal-header">
            <h3>Complete Your Profile</h3>
            <p>Please provide your phone number and create a password to complete your account setup.</p>
          </div>

          <form onSubmit={handlePhoneSubmit} className="phone-form">
            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                placeholder="10 digit mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={phoneLoading}
              />
              <small>10 digits without country code</small>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password (Required for backup login)</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Create a password (min 6 characters)"
                  minLength="6"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={phoneLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <small>Required: Create password for backup login</small>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  minLength="6"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={phoneLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={phoneLoading || phoneNumber.length !== 10}
            >
              {phoneLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <div className="phone-modal-footer">
            <p className="phone-note">
              <strong>Note:</strong> Your phone number will be visible to other users for contact purposes.
              The password enables backup login access.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;