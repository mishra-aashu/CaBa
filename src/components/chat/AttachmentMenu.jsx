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
  const [uploadingType, setUploadingType] = useState(null);
  const menuRef = useRef(null);
  const fileInputRefs = useRef({});
  
  const { uploadFile } = useMediaUpload();

  const menuItems = [
    {
      id: 1,
      name: 'Camera',
      icon: 'fas fa-camera',
      color: '#E91E63',
      type: 'camera',
      isCamera: true,
      accept: 'image/*',
      maxSize: '20MB'
    },
    {
      id: 2,
      name: 'Gallery',
      icon: 'fas fa-images',
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
      icon: 'fas fa-bell',
      color: '#00BCD4',
      type: 'reminder',
      accept: null,
      maxSize: null
    }
  ];

  const handleFileSelect = async (itemType) => {
    const item = menuItems.find(i => i.type === itemType);
    if (!item) return;

    if (item.type === 'location') {
      handleLocationShare();
      onClose();
      return;
    }
    
    if (item.type === 'reminder') {
      handleReminderShare();
      onClose();
      return;
    }

    if (item.isCamera) {
      handleCameraCapture();
      return;
    }
    
    if (fileInputRefs.current[itemType]) {
      fileInputRefs.current[itemType].click();
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRefs.current['camera']) {
      fileInputRefs.current['camera'].click();
    }
  };

  const handleFileUpload = async (file, fileType) => {
    if (!file || !fileType) return;

    setUploadingType(fileType);
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        alert('Please log in to send files');
        return;
      }

      const uploadResult = await uploadFile(file, fileType, currentUser.id);
      await sendMediaMessage(uploadResult, fileType, file);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploadingType(null);
    }
  };

  const sendMediaMessage = async (uploadResult, fileType, originalFile) => {
    try {
      const mediaData = {
        mediaUrl: uploadResult.storageUrl,
        mediaType: fileType,
        fileName: originalFile.name,
        fileSize: originalFile.size,
        mimeType: originalFile.type
      };

      onFileSelect(mediaData);
      
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  };

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

  const handleReminderShare = () => {
    const reminderData = {
      type: 'reminder',
      message: 'This is a reminder message',
      timestamp: new Date().toISOString()
    };
    onFileSelect(reminderData);
  };

  if (!isVisible) {
    return null;
  }
  
  return (
    <>
      <div className="whatsapp-attachment-overlay" onClick={onClose} />

      <div className="whatsapp-attachment-popup" ref={menuRef}>
        <div className="whatsapp-attachment-header">
          <button className="whatsapp-attachment-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
          <h3>Share</h3>
          <div></div>
        </div>

        <div className="attachment-menu-grid">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className={`attachment-menu-item ${uploadingType === item.type ? 'uploading' : ''}`}
              onClick={() => handleFileSelect(item.type)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="attachment-icon-container"
                style={{ backgroundColor: item.color }}
              >
                {uploadingType === item.type ? (
                  <i className="fas fa-spinner upload-spinner"></i>
                ) : (
                  <i className={item.icon}></i>
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
          ))}
        </div>

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
                  onClose();
                }
              }}
            />
          ))}

        <input
          ref={el => fileInputRefs.current['camera'] = el}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files[0]) {
              handleFileUpload(e.target.files[0], 'camera');
              onClose();
            }
          }}
        />
      </div>
    </>
  );
};

export default AttachmentMenu;