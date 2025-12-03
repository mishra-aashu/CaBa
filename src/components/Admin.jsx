import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { ArrowLeft, MessageSquare, Users, Settings, BarChart3, Shield } from 'lucide-react';
import './admin/Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const { user, supabase } = useSupabase();
  const [currentUser, setCurrentUser] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    supportMessages: 0,
    onlineUsers: 0
  });

  useEffect(() => {
    checkAdminAccess();
    loadAdminData();
  }, []);

  const checkAdminAccess = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user is admin (phone number check for now)
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !userData) {
        alert('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      // Check if phone is admin phone (you can modify this logic)
      if (userData.phone !== '8002122966') {
        alert('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      setCurrentUser(userData);
    } catch (error) {
      console.error('Admin access check error:', error);
      navigate('/');
    }
  };

  const loadAdminData = async () => {
    try {
      // Load support messages from localStorage for now
      const storedMessages = localStorage.getItem('supportMessages');
      if (storedMessages) {
        const messages = JSON.parse(storedMessages);
        setSupportMessages(messages);
        setStats(prev => ({ ...prev, supportMessages: messages.length }));
      }

      // Load basic stats
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, is_online')
        .neq('phone', '1234'); // Exclude support account

      if (!usersError && users) {
        const onlineUsers = users.filter(u => u.is_online).length;
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          onlineUsers
        }));
      }

      // Load message count (approximate)
      const { count: messageCount, error: msgError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      if (!msgError) {
        setStats(prev => ({ ...prev, totalMessages: messageCount || 0 }));
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = (messageId) => {
    const updatedMessages = supportMessages.map(msg =>
      msg.id === messageId ? { ...msg, isRead: true } : msg
    );
    setSupportMessages(updatedMessages);
    localStorage.setItem('supportMessages', JSON.stringify(updatedMessages));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={24} />
          </button>
          <h1>Admin Panel</h1>
        </div>
        <div className="header-right">
          <span className="admin-badge">
            <Shield size={16} />
            Admin
          </span>
        </div>
      </header>

      <div className="admin-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MessageSquare size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalMessages}</h3>
              <p>Total Messages</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.onlineUsers}</h3>
              <p>Online Users</p>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">
              <Shield size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.supportMessages}</h3>
              <p>Support Messages</p>
            </div>
          </div>
        </div>

        {/* Support Messages Section */}
        <div className="admin-section">
          <h2>Support Messages</h2>
          <div className="support-messages-list">
            {supportMessages.length > 0 ? (
              supportMessages.map(message => (
                <div
                  key={message.id}
                  className={`support-message-item ${message.isRead ? 'read' : 'unread'}`}
                  onClick={() => !message.isRead && markMessageAsRead(message.id)}
                >
                  <div className="message-header">
                    <div className="user-info">
                      <span className="user-name">{message.userName}</span>
                      <span className="user-phone">({message.userPhone})</span>
                    </div>
                    <div className="message-meta">
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                      {!message.isRead && <span className="unread-indicator">New</span>}
                    </div>
                  </div>
                  <div className="message-content">
                    <p>{message.text}</p>
                  </div>
                  {message.supportResponse && (
                    <div className="support-response">
                      <strong>Your response:</strong> {message.supportResponse}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-messages">
                <MessageSquare size={48} />
                <p>No support messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button
              className="action-btn"
              onClick={() => navigate('/support')}
            >
              <MessageSquare size={20} />
              Open Support Chat
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/settings')}
            >
              <Settings size={20} />
              App Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;