import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
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

const UserDetails = ({ userId, onBack }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUserDetails();
  }, [userId]);

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

      await loadUserDetails(userId);
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

  const handleMessage = () => {
    alert('Navigate to chat - feature not implemented');
  };

  const handleCall = () => {
    alert('Start voice call - feature not implemented');
  };

  const handleVideoCall = () => {
    alert('Start video call - feature not implemented');
  };

  const handleBlock = () => {
    alert('Block user - feature not implemented');
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
        <button onClick={onBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="user-details-container">
      <header className="app-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        <div className="header-center">
          <h1>Contact Info</h1>
        </div>
        <div className="header-right">
          <button className="icon-btn">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </header>

      {/* User Profile Section */}
      <div className="user-profile-section">
        <div className="user-avatar">
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
          <span className="label">Message</span>
        </button>
        <button className="action-btn" onClick={handleCall}>
          <i className="fas fa-phone icon"></i>
          <span className="label">Call</span>
        </button>
        <button className="action-btn" onClick={handleVideoCall}>
          <i className="fas fa-video icon"></i>
          <span className="label">Video</span>
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
              <span className="count">0</span>
            </div>
            <div className="media-item">
              <i className="fas fa-link icon"></i>
              <span className="count">0</span>
            </div>
            <div className="media-item">
              <i className="fas fa-file icon"></i>
              <span className="count">0</span>
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