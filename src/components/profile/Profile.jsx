import React, { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import '../../styles/profile.css';

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

const Profile = () => {
  const { supabase } = useSupabase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ chats: 0, calls: 0, contacts: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDpModal, setShowDpModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanQrModal, setShowScanQrModal] = useState(false);
  const [showUserFoundModal, setShowUserFoundModal] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [editForm, setEditForm] = useState({ name: '', about: '', email: '' });
  const [modalForm, setModalForm] = useState({ name: '', about: '', email: '' });
  const [dpOptions, setDpOptions] = useState(dpOptionsData);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const qrReaderRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
    return () => {
      // Cleanup audio on unmount
      if (currentPlayingAudio) {
        currentPlayingAudio.pause();
      }
    };
  }, []);

  // Load profile data
  const loadProfileData = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        window.location.href = '/login.html';
        return;
      }

      // Try to get from cache first
      const cachedProfile = localStorage.getItem(`digidad_profile_${authUser.id}`);
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        setUser(profile);
        loadProfileStats(profile.id);
      }

      // Fetch fresh data
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      let currentUser;
      if (error && error.code === 'PGRST116') {
        // Create profile if not exists
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([{
            id: authUser.id,
            name: authUser.user_metadata?.name || 'User',
            phone: authUser.user_metadata?.phone || '',
            email: authUser.email,
            avatar: authUser.user_metadata?.avatar || null,
            about: authUser.user_metadata?.about || 'Hey there! I am using CaBa',
            is_online: false,
            last_seen: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) throw createError;
        currentUser = {
          id: authUser.id,
          name: newProfile.name,
          phone: newProfile.phone,
          email: newProfile.email,
          avatar: newProfile.avatar,
          about: newProfile.about,
          created_at: newProfile.created_at
        };
      } else if (error) {
        throw error;
      } else {
        currentUser = {
          id: authUser.id,
          name: userProfile?.name || authUser.user_metadata?.name || 'User',
          phone: authUser.user_metadata?.phone || userProfile?.phone,
          email: authUser.email || userProfile?.email,
          avatar: userProfile?.avatar || authUser.user_metadata?.avatar,
          about: userProfile?.about || authUser.user_metadata?.about || 'Hey there! I am using CaBa',
          created_at: userProfile?.created_at || authUser.created_at
        };
      }

      // Cache and update state
      localStorage.setItem(`digidad_profile_${authUser.id}`, JSON.stringify(currentUser));
      setUser(currentUser);
      loadProfileStats(currentUser.id);

    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Load profile stats
  const loadProfileStats = async (userId) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const contactCount = users.filter(u => u.phone !== currentUser.phone).length;

      setStats({
        chats: contactCount || 0,
        calls: 0, // Not implemented
        contacts: contactCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({ chats: 0, calls: 0, contacts: 0 });
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setEditForm({
      name: user.name,
      about: user.about || '',
      email: user.email || ''
    });
    setShowEditModal(true);
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) throw new Error('Not authenticated');

      const { name, about, email } = editForm;

      if (name.length < 3) {
        alert('Name must be at least 3 characters');
        return;
      }

      if (email && !validateEmail(email)) {
        alert('Invalid email address');
        return;
      }

      // Update auth metadata
      const { error: updateAuthError } = await supabase.auth.updateUser({
        email: email || undefined,
        data: { name, about }
      });

      if (updateAuthError) {
        console.warn('Auth update failed:', updateAuthError);
      }

      // Update profile in database
      const { error } = await supabase
        .from('users')
        .update({ name, about, email: email || null })
        .eq('id', authUser.id);

      if (error) throw error;

      // Update local state and cache
      const updatedUser = { ...user, name, about, email };
      setUser(updatedUser);
      localStorage.setItem(`digidad_profile_${authUser.id}`, JSON.stringify(updatedUser));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      setShowEditModal(false);
      alert('Profile updated successfully');

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  // Handle individual field edits
  const handleEditName = () => {
    setModalForm({ ...modalForm, name: user.name });
    setShowNameModal(true);
  };

  const handleEditAbout = () => {
    setModalForm({ ...modalForm, about: user.about || '' });
    setShowAboutModal(true);
  };

  const handleEditEmail = () => {
    setModalForm({ ...modalForm, email: user.email || '' });
    setShowEmailModal(true);
  };

  // Save individual fields
  const saveName = async () => {
    const name = modalForm.name.trim();
    if (name.length < 3) {
      alert('Name must be at least 3 characters');
      return;
    }
    await updateField('name', name);
    setShowNameModal(false);
  };

  const saveAbout = async () => {
    const about = modalForm.about.trim();
    await updateField('about', about);
    setShowAboutModal(false);
  };

  const saveEmail = async () => {
    const email = modalForm.email.trim();
    if (email && !validateEmail(email)) {
      alert('Invalid email address');
      return;
    }
    await updateField('email', email);
    setShowEmailModal(false);
  };

  // Update individual field
  const updateField = async (field, value) => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) throw new Error('Not authenticated');

      // Update auth metadata
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: { [field]: value }
      });

      if (updateAuthError) {
        console.warn('Auth update failed:', updateAuthError);
      }

      // Update profile in database
      const { error } = await supabase
        .from('users')
        .update({ [field]: value })
        .eq('id', authUser.id);

      if (error) throw error;

      // Update local state
      const updatedUser = { ...user, [field]: value };
      setUser(updatedUser);
      localStorage.setItem(`digidad_profile_${authUser.id}`, JSON.stringify(updatedUser));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);

    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      alert(`Failed to update ${field}`);
    }
  };

  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle avatar upload
  const handleUploadPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Handle file upload (would need media uploader integration)
        alert('Photo upload functionality would be implemented here');
      }
    };
    input.click();
  };

  // Handle DP selection
  const handleChooseDp = () => {
    setShowDpModal(true);
  };

  const selectDp = async (dpId) => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('users')
        .update({ avatar: dpId.toString() })
        .eq('id', authUser.id);

      if (error) throw error;

      const updatedUser = { ...user, avatar: dpId.toString() };
      setUser(updatedUser);
      localStorage.setItem(`digidad_profile_${authUser.id}`, JSON.stringify(updatedUser));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      setShowDpModal(false);
      alert('Profile picture updated');

    } catch (error) {
      console.error('Error selecting DP:', error);
      alert('Failed to update profile picture');
    }
  };

  // Share profile
  const shareProfile = () => {
    const shareUrl = `${window.location.origin}/shared-profile.html?userId=${user.id}`;
    const shareText = `Connect with me on CaBa!\nName: ${user.name}\nPhone: ${user.phone}\n\nView Profile: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'CaBa Profile',
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Profile link copied to clipboard');
      });
    }
  };

  // QR Code functionality
  const showQRCode = () => {
    const shareUrl = `${window.location.origin}/shared-profile.html?userId=${user.id}`;
    setQrCode(shareUrl);
    setShowQrModal(true);
  };

  const saveQrCode = () => {
    // QR code saving would require canvas implementation
    alert('QR code saving functionality would be implemented here');
  };

  const scanQrCode = () => {
    setShowQrModal(false);
    setShowScanQrModal(true);
    // Initialize QR scanner
    initializeQrScanner();
  };

  const initializeQrScanner = () => {
    // QR scanner initialization would require html5-qrcode library
    alert('QR scanning functionality would be implemented here');
  };

  // User found modal
  const displayUserFoundModal = (foundUserData) => {
    setFoundUser(foundUserData);
    setShowUserFoundModal(true);
  };

  const addToContacts = () => {
    // Add to contacts logic
    let contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    if (!contacts.some(c => c.id === foundUser.id)) {
      contacts.push({
        id: foundUser.id,
        name: foundUser.name,
        phone: foundUser.phone,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem('contacts', JSON.stringify(contacts));
      alert(`${foundUser.name} added to contacts`);
    } else {
      alert('User already in contacts');
    }
    setShowUserFoundModal(false);
  };

  const chatWithUser = () => {
    sessionStorage.setItem('chatTargetUser', JSON.stringify({
      id: foundUser.id,
      name: foundUser.name
    }));
    window.location.href = 'chat.html';
  };

  if (loading) {
    return (
      <div className="profile-screen">
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-screen">
      {/* Profile Header */}
      <header className="profile-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <span className="icon">←</span>
        </button>
        <h1>Profile</h1>
        <button className="icon-btn" onClick={handleEditProfile}>
          <i className="fas fa-edit"></i>
        </button>
      </header>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-avatar">
            {user.avatar ? (
              <img
                src={parseInt(user.avatar) ?
                  dpOptions.find(dp => dp.id === parseInt(user.avatar))?.path :
                  user.avatar}
                alt="Profile Picture"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className="profile-initials">{getInitials(user.name)}</div>
            )}
            <div className="avatar-action-buttons">
              <button className="avatar-action-btn camera-btn" onClick={handleUploadPhoto} title="Upload Photo">
                <i className="fas fa-camera"></i>
              </button>
              <button className="avatar-action-btn dp-btn" onClick={handleChooseDp} title="Choose DP">
                <i className="fas fa-images"></i>
              </button>
            </div>
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
            <div className="info-value" style={{ display: 'flex', alignItems: 'center' }}>
              <span>{user.name}</span>
              <button className="edit-name-btn" onClick={handleEditName} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', padding: '5px', fontSize: '16px' }}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
          </div>

          {/* About */}
          <div className="info-item">
            <div className="info-label">
              <i className="fas fa-info-circle"></i>
              <span className="label">About</span>
            </div>
            <div className="info-value" style={{ display: 'flex', alignItems: 'center' }}>
              <span>{user.about || 'Hey there! I am using CaBa'}</span>
              <button className="edit-about-btn" onClick={handleEditAbout} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', padding: '5px', fontSize: '16px' }}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="info-item">
            <div className="info-label">
              <i className="fas fa-phone"></i>
              <span className="label">Phone</span>
            </div>
            <div className="info-value">
              <span>{user.phone}</span>
            </div>
          </div>

          {/* Email */}
          <div className="info-item">
            <div className="info-label">
              <i className="fas fa-envelope"></i>
              <span className="label">Email</span>
            </div>
            <div className="info-value" style={{ display: 'flex', alignItems: 'center' }}>
              <span>{user.email || 'Not set'}</span>
              <button className="edit-email-btn" onClick={handleEditEmail} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', padding: '5px', fontSize: '16px' }}>
                <i className="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <h3>{stats.chats}</h3>
            <p>Chats</p>
          </div>
          <div className="stat-item">
            <h3>{stats.calls}</h3>
            <p>Calls</p>
          </div>
          <div className="stat-item">
            <h3>{stats.contacts}</h3>
            <p>Contacts</p>
          </div>
        </div>

        {/* Account Actions */}
        <div className="profile-actions">
          <button className="action-btn" onClick={shareProfile}>
            <i className="fas fa-share"></i>
            <span className="label">Share Profile</span>
          </button>
          <button className="action-btn" onClick={showQRCode}>
            <i className="fas fa-qrcode"></i>
            <span className="label">My QR Code</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-modal" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); saveProfileChanges(); }}>
                <div className="input-group">
                  <label htmlFor="editName">Full Name</label>
                  <input
                    type="text"
                    id="editName"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    minLength="3"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="editAbout">About</label>
                  <textarea
                    id="editAbout"
                    rows="3"
                    maxLength="150"
                    value={editForm.about}
                    onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="editEmail">Email</label>
                  <input
                    type="email"
                    id="editEmail"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary">Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Name Modal */}
      {showNameModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Name</h2>
              <button className="close-modal" onClick={() => setShowNameModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); saveName(); }}>
                <div className="input-group">
                  <label htmlFor="modalEditName">Full Name</label>
                  <input
                    type="text"
                    id="modalEditName"
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    required
                    minLength="3"
                  />
                </div>
                <button type="submit" className="btn-primary">Save</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit About Modal */}
      {showAboutModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit About</h2>
              <button className="close-modal" onClick={() => setShowAboutModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); saveAbout(); }}>
                <div className="input-group">
                  <label htmlFor="modalEditAbout">About</label>
                  <textarea
                    id="modalEditAbout"
                    rows="3"
                    maxLength="150"
                    value={modalForm.about}
                    onChange={(e) => setModalForm({ ...modalForm, about: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary">Save</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Email Modal */}
      {showEmailModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Email</h2>
              <button className="close-modal" onClick={() => setShowEmailModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); saveEmail(); }}>
                <div className="input-group">
                  <label htmlFor="modalEditEmail">Email</label>
                  <input
                    type="email"
                    id="modalEditEmail"
                    value={modalForm.email}
                    onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary">Save</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Choose DP Modal */}
      {showDpModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Choose Profile Picture</h2>
              <button className="close-modal" onClick={() => setShowDpModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="dp-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                {dpOptions.map(option => (
                  <img
                    key={option.id}
                    src={option.path}
                    alt={`DP ${option.id}`}
                    style={{ width: '80px', height: '80px', borderRadius: '8px', cursor: 'pointer', objectFit: 'cover' }}
                    onClick={() => selectDp(option.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>My QR Code</h2>
              <button className="close-modal" onClick={() => setShowQrModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div id="qrcode" style={{ display: 'inline-block', marginBottom: '20px' }}>
                {/* QR Code would be generated here */}
                <div style={{ width: '200px', height: '200px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  QR Code
                </div>
              </div>
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Scan this QR code to view my profile</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={saveQrCode}>
                  <i className="fas fa-download"></i>
                  Save QR Code
                </button>
                <button className="btn-primary" onClick={scanQrCode}>
                  <i className="fas fa-camera"></i>
                  Scan QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scan QR Modal */}
      {showScanQrModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Scan QR Code</h2>
              <button className="close-modal" onClick={() => setShowScanQrModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div id="qr-reader" ref={qrReaderRef} style={{ width: '100%', maxWidth: '400px', margin: '0 auto', height: '300px', border: '1px solid #ccc' }}>
                {/* QR Scanner would be initialized here */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  Camera View
                </div>
              </div>
              <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Point your camera at a QR code to scan</p>
              <button className="btn-secondary" style={{ marginTop: '20px' }}>
                <i className="fas fa-upload"></i>
                Upload from Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Found Modal */}
      {showUserFoundModal && foundUser && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>User Found</h2>
              <button className="close-modal" onClick={() => setShowUserFoundModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', color: 'white', fontSize: '24px' }}>
                    {getInitials(foundUser.name)}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ margin: '0', color: 'var(--text-primary)' }}>{foundUser.name}</h3>
                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)' }}>{foundUser.phone}</p>
                    {foundUser.about && <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '14px' }}>{foundUser.about}</p>}
                  </div>
                </div>
              </div>
              <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={addToContacts}>
                  <i className="fas fa-user-plus"></i>
                  Add to Contacts
                </button>
                <button className="btn-secondary" onClick={chatWithUser}>
                  <i className="fas fa-comment"></i>
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;