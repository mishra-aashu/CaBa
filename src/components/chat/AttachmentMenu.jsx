import React, { useState, useRef, useEffect } from 'react';
import { useMediaUpload } from '../../hooks/media/useMediaUpload';
import { useChatTheme } from '../../contexts/ChatThemeContext';
import { useAuth } from '../../hooks/useAuth';
import './AttachmentMenu.css';

const AttachmentMenu = ({
  isVisible,
  onFileSelect,
  onClose,
  chatId,
  receiverId
}) => {
  const [isOpen, setIsOpen] = useState(isVisible);
  const [uploadingType, setUploadingType] = useState(null);
  const menuRef = useRef(null);
  const fileInputRefs = useRef({});
  
  // Get theme context for dynamic colors
  const { currentThemeData } = useChatTheme();
  const { user: currentUser, isAuthenticated } = useAuth();

  const { uploadFile } = useMediaUpload();

  // Menu items with unique distinctive icons and colors
  const menuItems = [
    {
      id: 1,
      name: 'Camera',
      icon: 'fas fa-camera-retro',
      color: '#E91E63',
      type: 'camera',
      isCamera: true,
      accept: 'image/*',
      maxSize: '20MB'
    },
    {
      id: 2,
      name: 'Images',
      icon: 'fas fa-image',
      color: '#9C27B0',
      type: 'images',
      accept: 'image/*',
      maxSize: '20MB'
    },
    {
      id: 3,
      name: 'Video',
      icon: 'fas fa-video',
      color: '#FF5722',
      type: 'video',
      accept: 'video/*',
      maxSize: '100MB'
    },
    {
      id: 4,
      name: 'Audio',
      icon: 'fas fa-microphone',
      color: '#FF9800',
      type: 'audio',
      accept: 'audio/*',
      maxSize: '10MB'
    },
    {
      id: 5,
      name: 'Location',
      icon: 'fas fa-map-marker-alt',
      color: '#4CAF50',
      type: 'location',
      accept: null,
      maxSize: null
    },
    {
      id: 6,
      name: 'Reminder',
      icon: 'fas fa-stopwatch',
      color: '#00BCD4',
      type: 'reminder',
      accept: null,
      maxSize: null
    }
  ];

  // Sync with parent visibility
  useEffect(() => {
    setIsOpen(isVisible);
  }, [isVisible]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  // Handle file selection and upload
  const handleFileSelect = async (itemType) => {
    const item = menuItems.find(i => i.type === itemType);
    if (!item) return;

    // Handle special cases (location, reminder)
    if (item.type === 'location') {
      handleLocationShare();
      handleClose();
      return;
    }
    
    if (item.type === 'reminder') {
      handleReminderShare();
      handleClose();
      return;
    }

    // Handle special cases for camera and images
    if (item.isCamera) {
      handleCameraCapture();
      return;
    }
    
    // Handle file uploads
    if (fileInputRefs.current[itemType]) {
      fileInputRefs.current[itemType].click();
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    if (fileInputRefs.current['camera']) {
      fileInputRefs.current['camera'].click();
    }
  };

  // Handle file upload with backend integration
  const handleFileUpload = async (file, fileType) => {
    if (!file || !fileType) return;

    setUploadingType(fileType);

    try {
      // Check authentication
      if (!isAuthenticated || !currentUser) {
        alert('Please log in to send files');
        return;
      }

      // Validate file type
      const validation = validateFile(file, fileType);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Upload file using existing hook
      const uploadResult = await uploadFile(file, fileType, currentUser.id);

      // Send message with media
      await sendMediaMessage(uploadResult, fileType, file);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploadingType(null);
    }
  };

  // Send media message through backend
  const sendMediaMessage = async (uploadResult, fileType, originalFile) => {
    try {
      // Create media data for message
      const mediaData = {
        mediaUrl: uploadResult.storageUrl,
        mediaType: fileType,
        fileName: originalFile.name,
        fileSize: originalFile.size,
        mimeType: originalFile.type
      };

      // Call parent's onFileSelect with media data
      onFileSelect(mediaData);
      
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  };

  // File validation
  const validateFile = (file, fileType) => {
    const supportedTypes = {
      camera: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
      audio: ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/webm']
    };

    const maxSizes = {
      camera: 20 * 1024 * 1024,    // 20MB
      images: 20 * 1024 * 1024,    // 20MB
      video: 100 * 1024 * 1024,    // 100MB
      audio: 10 * 1024 * 1024      // 10MB
    };

    // Check file type
    const validTypes = supportedTypes[fileType];
    if (!validTypes || !validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type. Supported types: ${validTypes.join(', ')}`
      };
    }

    // Check file size
    const maxSize = maxSizes[fileType];
    if (file.size > maxSize) {
      const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
      };
      
      return {
        valid: false,
        error: `File too large. Maximum size: ${formatFileSize(maxSize)}`
      };
    }

    return { valid: true };
  };

  // Location sharing
  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = {
            type: 'location',
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          };
          onFileSelect(locationData);
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Reminder sharing
  const handleReminderShare = () => {
    const reminderData = {
      type: 'reminder',
      message: 'This is a reminder message',
      timestamp: new Date().toISOString()
    };
    onFileSelect(reminderData);
  };

  if (!isOpen) {
    return null;
  }
  
  return (
    <>
      {/* Overlay */}
      <div className="whatsapp-attachment-overlay" onClick={handleClose} />

      {/* WhatsApp-Style Bottom Attachment Menu */}
      <div
        className="whatsapp-attachment-popup"
        ref={menuRef}
        style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          background: 'var(--chat-input-bg, #233138)',
          color: 'var(--chat-input-text, #e9edef)',
          zIndex: '999999',
          transform: 'translateY(0)',
          opacity: 1,
          visibility: 'visible',
          padding: '20px',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="whatsapp-attachment-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <button
            className="whatsapp-attachment-close"
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--chat-input-icon-color, #8696a0)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%'
            }}
          >
            <i className="fas fa-times"></i>
          </button>
          <h3 style={{
            margin: '0',
            color: 'var(--chat-input-text, #e9edef)',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Share
          </h3>
          <div></div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }}>
          {menuItems.map((item, index) => {
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: `2px solid ${item.color}`,
                  transition: 'transform 0.2s',
                  minHeight: '90px'
                }}
                onClick={() => {
                  handleFileSelect(item.type);
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <div
                  style={{
                    backgroundColor: item.color,
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid white'
                  }}
                >
                  <i className={item.icon} style={{
                    fontSize: '32px',
                    color: 'white'
                  }}></i>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--chat-input-text, #e9edef)',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {item.name}
                </span>
                {item.maxSize && (
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--chat-input-icon-color, #6b7280)',
                    textAlign: 'center',
                    marginTop: '2px'
                  }}>
                    Max {item.maxSize}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hidden file inputs for each file type */}
        {menuItems
          .filter(item => item.accept && !item.isCamera)
          .map(item => (
            <input
              key={`input-${item.type}`}
              ref={el => fileInputRefs.current[item.type] = el}
              type="file"
              accept={item.accept}
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleFileUpload(e.target.files[0], item.type);
                  handleClose();
                }
              }}
            />
          ))}

        {/* Camera capture input with camera capture attribute */}
        <input
          ref={el => fileInputRefs.current['camera'] = el}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files[0]) {
              handleFileUpload(e.target.files[0], 'camera');
              handleClose();
            }
          }}
        />
      </div>
    </>
  );
};

export default AttachmentMenu;