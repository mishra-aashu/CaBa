import React, { useState, useRef } from 'react';
import EmojiPicker from '../common/EmojiPicker';

const MessageInput = ({ onSendMessage, onTyping, replyingTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const textareaRef = useRef(null);

  // Default quick reply messages
  const quickReplies = [
    'Hello!',
    'How are you?',
    'Thank you!',
    'Sorry',
    'Okay',
    'Yes',
    'No',
    'Please',
    'Good morning',
    'Good night'
  ];

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Trigger typing indicator
    onTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
  };

  const toggleAttachmentMenu = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  const handleFileSelect = (type) => {
    // Handle file selection based on type
    console.log('File type selected:', type);
    setShowAttachmentMenu(false);
  };

  const handleQuickReply = (reply) => {
    onSendMessage(reply);
    setShowQuickReplies(false);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
    }
  };

  const toggleQuickReplies = () => {
    setShowQuickReplies(!showQuickReplies);
    setShowAttachmentMenu(false);
  };

  return (
    <div className="chat-input-container">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="reply-preview-bar">
          <div className="reply-preview-content">
            <div className="reply-author">
              Replying to {replyingTo.sender_id === JSON.parse(localStorage.getItem('currentUser')).id ? 'You' : 'Them'}
            </div>
            <div className="reply-text">{replyingTo.content}</div>
          </div>
          <button className="reply-close-btn" onClick={onCancelReply}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="input-row">
        <button
          className="btn-attach"
          onClick={toggleAttachmentMenu}
          title="Attach"
        >
          <i className="fas fa-paperclip"></i>
        </button>

        <button
          className="btn-quick-reply"
          onClick={toggleQuickReplies}
          title="Quick Replies"
        >
          <i className="fas fa-comment-dots"></i>
        </button>

        <EmojiPicker onEmojiSelect={handleEmojiSelect} />

        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          rows={1}
        />

        <button
          className="btn-send"
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <span id="sendIcon">
            <i className="fas fa-paper-plane"></i>
          </span>
        </button>
      </div>

      {/* Attachment Menu */}
      {showAttachmentMenu && (
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
      )}

      {/* Quick Replies Menu */}
      {showQuickReplies && (
        <div className="quick-replies-menu">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className="quick-reply-option"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageInput;