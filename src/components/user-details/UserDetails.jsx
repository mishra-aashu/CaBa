import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { useCall } from '../../context/CallContext';
import { X } from 'lucide-react';
import './UserDetails.css';

// DP options for avatar display
const baseUrl = import.meta.env.BASE_URL || '/';
const dpOptionsData = [
  { id: 1, path: `${baseUrl}assets/images/dp-options/00701602b0eac0390b3107b9e2a665e0.jpg` },
  { id: 2, path: `${baseUrl}assets/images/dp-options/1691130988954.jpg` },
  { id: 3, path: `${baseUrl}assets/images/dp-options/aesthetic-cartoon-funny-dp-for-instagram.webp` },
  { id: 4, path: `${baseUrl}assets/images/dp-options/boy-cartoon-dp-with-hoodie.webp` },
  { id: 5, path: `${baseUrl}assets/images/dp-options/download (1).jpg` },
  { id: 6, path: `${baseUrl}assets/images/dp-options/download.jpg` },
  { id: 7, path: `${baseUrl}assets/images/dp-options/funny-profile-picture-wd195eo9rpjy7ax1.jpg` },
  { id: 8, path: `${baseUrl}assets/images/dp-options/funny-whatsapp-dp-for-girls.webp` },
  { id: 9, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575118_y.jpg` },
  { id: 10, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575119_y.jpg` },
  { id: 11, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575120_y.jpg` },
  { id: 12, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575121_y.jpg` },
  { id: 13, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575122_y.jpg` },
  { id: 14, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575123_y.jpg` },
  { id: 15, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575124_y.jpg` },
  { id: 16, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575125_y.jpg` },
  { id: 17, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575126_y.jpg` },
  { id: 18, path: `${baseUrl}assets/images/dp-options/photo_5230962651624575127_y.jpg` },
  { id: 19, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267708_w.jpg` },
  { id: 20, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267709_w.jpg` },
  { id: 21, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267710_w.jpg` },
  { id: 22, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267711_w.jpg` },
  { id: 23, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267712_w.jpg` },
  { id: 24, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267713_w.jpg` },
  { id: 25, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267714_w.jpg` },
  { id: 26, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267715_w.jpg` },
  { id: 27, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267716_w.jpg` },
  { id: 28, path: `${baseUrl}assets/images/dp-options/photo_5235923888607267717_w.jpg` }
];

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startCall } = useCall();
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaCounts, setMediaCounts] = useState({ images: 0, links: 0, docs: 0 });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    initializeUserDetails();
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const initializeUserDetails = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        alert('No user logged in');
        setLoading(false);
        return;
      }
      const currentUserData = JSON.parse(userStr);
      setCurrentUser(currentUserData);

      await loadUserDetails(id);
      await loadMediaCounts(id);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing user details:', error);
      setLoading(false);
    }
  };

  const loadUserDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user details:', error);
      alert('Failed to load user details');
    }
  };

  const loadMediaCounts = async (userId) => {
    try {
      // Find the chat between current user and viewed user
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${currentUser.id})`)
        .single();

      if (chatError || !chat) {
        setMediaCounts({ images: 0, links: 0, docs: 0 });
        return;
      }

      // Count different types of media messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('message_type, content')
        .eq('chat_id', chat.id);

      if (messagesError) throw messagesError;

      let images = 0, links = 0, docs = 0;

      messages.forEach(msg => {
        if (msg.message_type === 'image') images++;
        else if (msg.message_type === 'document') docs++;
        else if (msg.content && (msg.content.includes('http://') || msg.content.includes('https://'))) links++;
      });

      setMediaCounts({ images, links, docs });
    } catch (error) {
      console.error('Error loading media counts:', error);
      setMediaCounts({ images: 0, links: 0, docs: 0 });
    }
  };

  const handleMessage = () => {
    navigate(`/chat/new/${id}`);
  };

  const handleCall = async () => {
    try {
      const { callId } = await startCall(user.id, 'voice');
      navigate(`/call/${callId}`);
    } catch (error) {
      console.error('Failed to start voice call:', error);
      alert('Failed to start call: ' + error.message);
    }
  };

  const handleVideoCall = async () => {
    try {
      const { callId } = await startCall(user.id, 'video');
      navigate(`/call/${callId}`);
    } catch (error) {
      console.error('Failed to start video call:', error);
      alert('Failed to start call: ' + error.message);
    }
  };

  const handleBlock = async () => {
    const confirmed = window.confirm(`Block ${user.name}? They won't be able to message or call you.`);
    if (!confirmed || !currentUser) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert([{
          blocker_id: currentUser.id,
          blocked_id: user.id
        }]);

      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="user-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-details-error">
        <p><X size={16} /> User not found</p>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="user-details-container">
      <header className="app-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        <div className="header-center">
          <h1>Contact Info</h1>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={() => console.log('Menu clicked')}>
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </header>

      {/* User Profile Section */}
      <div className="user-profile-section">
        <div className={`user-avatar ${isScrolled ? 'scrolled' : ''}`}>
          {user.avatar ? (
            parseInt(user.avatar) ? (
              <img src={dpOptionsData.find(dp => dp.id === parseInt(user.avatar))?.path || user.avatar} alt={user.name} />
            ) : (
              <img src={user.avatar} alt={user.name} />
            )
          ) : (
            getInitials(user.name)
          )}
        </div>
        <h2 className="user-name">{user.name}</h2>
        <p className="user-phone">{user.phone || 'No phone number'}</p>
      </div>

      {/* Action Buttons */}
      <div className="user-actions">
        <button className="action-btn" onClick={handleMessage}>
          <i className="fas fa-comment icon"></i>
        </button>
        <button className="action-btn" onClick={handleCall}>
          <i className="fas fa-phone icon"></i>
        </button>
        <button className="action-btn" onClick={handleVideoCall}>
          <i className="fas fa-video icon"></i>
        </button>
      </div>

      {/* User Information */}
      <div className="user-info-sections">
        {/* Media Section */}
        <div className="info-section">
          <h3 className="section-header">Media, Links, and Docs</h3>
          <div className="media-preview">
            <div className="media-item">
              <i className="fas fa-image icon"></i>
              <span className="count">{mediaCounts.images}</span>
            </div>
            <div className="media-item">
              <i className="fas fa-link icon"></i>
              <span className="count">{mediaCounts.links}</span>
            </div>
            <div className="media-item">
              <i className="fas fa-file icon"></i>
              <span className="count">{mediaCounts.docs}</span>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="info-section">
          <div className="settings-item toggle-item">
            <div className="item-left">
              <i className="fas fa-bell-slash icon"></i>
              <span className="label">Mute Notifications</span>
            </div>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="info-section">
          <div className="settings-item">
            <div className="item-left">
              <i className="fas fa-plus icon"></i>
              <span className="label">Add to Contacts</span>
            </div>
          </div>

          <div className="settings-item">
            <div className="item-left">
              <i className="fas fa-share icon"></i>
              <span className="label">Share Contact</span>
            </div>
          </div>

          <div className="settings-item">
            <div className="item-left">
              <i className="fas fa-download icon"></i>
              <span className="label">Export Chat</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="info-section danger-section">
          <div className="settings-item danger" onClick={handleBlock}>
            <div className="item-left">
              <i className="fas fa-ban icon"></i>
              <span className="label">Block Contact</span>
            </div>
          </div>

          <div className="settings-item danger">
            <div className="item-left">
              <i className="fas fa-exclamation-triangle icon"></i>
              <span className="label">Report Contact</span>
            </div>
          </div>

          <div className="settings-item danger">
            <div className="item-left">
              <i className="fas fa-trash icon"></i>
              <span className="label">Delete Contact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;