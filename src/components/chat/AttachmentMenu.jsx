import React from 'react';

const AttachmentMenu = ({ isVisible, onFileSelect, onClose }) => {
  if (!isVisible) return null;

  const handleFileSelect = (type) => {
    onFileSelect(type);
    onClose();
  };

  return (
    <div className="attachment-menu">
      <button
        className="attach-option"
        onClick={() => handleFileSelect('image')}
      >
        <i className="fas fa-image"></i>
        <span>Image</span>
      </button>
      <button
        className="attach-option"
        onClick={() => handleFileSelect('video')}
      >
        <i className="fas fa-video"></i>
        <span>Video</span>
      </button>
      <button
        className="attach-option"
        onClick={() => handleFileSelect('audio')}
      >
        <i className="fas fa-microphone"></i>
        <span>Audio</span>
      </button>
      <button
        className="attach-option"
        onClick={() => handleFileSelect('document')}
      >
        <i className="fas fa-file"></i>
        <span>Document</span>
      </button>
      <button
        className="attach-option"
        onClick={() => handleFileSelect('screen-share')}
      >
        <i className="fas fa-desktop"></i>
        <span>Screen Share</span>
      </button>
    </div>
  );
};

export default AttachmentMenu;