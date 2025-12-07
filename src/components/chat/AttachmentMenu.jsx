import React, { useState, useRef, useEffect } from 'react';
import { useMediaUpload } from '../../hooks/media/useMediaUpload';
import { useChatTheme } from '../../contexts/ChatThemeContext';
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

  const { uploadFile } = useMediaUpload();

  // Menu items with unique distinctive icons and colors
  const menuItems = [
    {
      id: 1,
      name: 'Camera',
      icon: '📸',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      type: 'camera',
      isCamera: true,
      accept: 'image/*',
      maxSize: '20MB'
    },
    {
      id: 2,
      name: 'Gallery',
      icon: '🖼️',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      type: 'images',
      accept: 'image/*',
      maxSize: '20MB'
    },
    {
      id: 3,
      name: 'Video',
      icon: '🎬',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      type: 'video',
      accept: 'video/*',
      maxSize: '100MB'
    },
    {
      id: 4,
      name: 'Audio',
      icon: '🎵',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      type: 'audio',
      accept: 'audio/*',
      maxSize: '10MB'
    },
    {
      id: 5,
      name: 'Location',
      icon: '📍',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      type: 'location',
      accept: null,
      maxSize: null
    },
    {
      id: 6,
      name: 'Reminder',
      icon: '⏰',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
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
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
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

        <div className="attachment-menu-grid">
          {menuItems.map((item, index) => {
            return (
              <div
                key={item.id}
                className={`attachment-menu-item ${uploadingType === item.type ? 'uploading' : ''}`}
                onClick={() => {
                  handleFileSelect(item.type);
                }}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div
                  className="attachment-icon-container"
                  style={{
                    background: item.gradient
                  }}
                >
                  {uploadingType === item.type ? (
                    <div className="upload-spinner">⏳</div>
                  ) : (
                    <span className="attachment-emoji-icon">{item.icon}</span>
                  )}
                </div>
                <span className="attachment-item-name">
                  {item.name}
                </span>
                {item.maxSize && (
                  <div className="attachment-size-info">
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