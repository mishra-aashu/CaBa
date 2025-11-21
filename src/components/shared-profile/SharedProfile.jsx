import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { X } from 'lucide-react';
import './SharedProfile.css';

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

const SharedProfile = ({ userId, onBack }) => {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSharedProfile();
  }, [userId]);

  const initializeSharedProfile = async () => {
    try {
      // Check if user is logged in
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }

      await loadSharedProfile(userId);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing shared profile:', error);
      setLoading(false);
    }
  };

  const loadSharedProfile = async (id) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, phone, avatar, about, created_at')
        .eq('id', id)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading shared profile:', error);
      alert('Profile not found');
    }
  };

  const handleAddToContacts = () => {
    alert('Add to contacts - feature not implemented');
  };

  const handleChat = () => {
    alert('Start chat - feature not implemented');
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="shared-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="shared-profile-error">
        <p><X size={16} /> Profile not found</p>
        <button onClick={onBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="shared-profile-container">
      <header className="app-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        <div className="header-center">
          <h1>Profile</h1>
        </div>
        <div className="header-right">
          {!currentUser && (
            <div className="auth-actions">
              <button className="btn-primary" onClick={() => alert('Login - feature not implemented')}>
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
              <button className="btn-secondary" onClick={() => alert('Sign up - feature not implemented')}>
                <i className="fas fa-user-plus"></i> Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-avatar">
            {user.avatar ? (
              parseInt(user.avatar) ? (
                <img src={dpOptionsData.find(dp => dp.id === parseInt(user.avatar))?.path || user.avatar} alt={user.name} />
              ) : (
                <img src={user.avatar} alt={user.name} />
              )
            ) : (
              <div className="profile-initials">{getInitials(user.name)}</div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          {/* Name */}
          <div className="info-item">
            <div className="info-label">
              <i className="fas fa-user"></i>
              <span className="label">Name</span>
            </div>
            <div className="info-value">
              <span>{user.name}</span>
            </div>
          </div>

          {/* About */}
          <div className="info-item">
            <div className="info-label">
              <i className="fas fa-info-circle"></i>
              <span className="label">About</span>
            </div>
            <div className="info-value">
              <span>{user.about || 'Hey there! I am using CaBa'}</span>
            </div>
          </div>

          {/* Phone */}
          <div className="info-item">
            <div className="info-label">
              <i className="fas fa-phone"></i>
              <span className="label">Phone</span>
            </div>
            <div className="info-value">
              <span>{user.phone || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (shown only when authenticated) */}
        {currentUser && (
          <div className="profile-actions">
            <button className="action-btn" onClick={handleAddToContacts}>
              <i className="fas fa-user-plus"></i>
              <span className="label">Add to Contacts</span>
            </button>
            <button className="action-btn" onClick={handleChat}>
              <i className="fas fa-comment"></i>
              <span className="label">Chat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedProfile;