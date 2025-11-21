import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';
import MediaMessage from './MediaMessage';
import { Calendar, Check, CheckCheck, MoreVertical } from 'lucide-react';

const MessageItem = ({
  message,
  currentUser,
  isSelected,
  isSelectionMode,
  onSelect,
  onReply
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  const isSent = message.sender_id === currentUser.id;
  const isReplied = message.reply_to;

  const handleLongPress = (e) => {
    e.preventDefault();
    if (!isSelectionMode) {
      onSelect();
    }
  };

  const handleClick = () => {
    if (isSelectionMode) {
      onSelect();
    }
  };

  const handleReply = () => {
    onReply(message);
    setShowActions(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setShowActions(false);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleForward = () => {
    // Copy to clipboard for forwarding
    navigator.clipboard.writeText(`Forwarded message:\n"${message.content}"`);
    setShowActions(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const saveEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      try {
        const { error } = await supabase
          .from('messages')
          .update({
            content: editContent.trim(),
            edited_at: new Date().toISOString()
          })
          .eq('id', message.id);

        if (error) throw error;

        message.content = editContent.trim();
        message.edited_at = new Date().toISOString();
      } catch (error) {
        console.error('Error editing message:', error);
      }
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', message.id);

      if (error) throw error;

      // The message will be removed from the list via real-time subscription
    } catch (error) {
      console.error('Error deleting message:', error);
    }
    setShowActions(false);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTouchStart = (e) => {
    setTouchStartTime(Date.now());
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;

    if (touchDuration > 500 && !isSelectionMode) {
      // Long press
      handleLongPress(e);
    }
  };

  const handleDownload = async (mediaUrl, messageId) => {
    // Placeholder for download functionality
    console.log('Downloading media:', mediaUrl, messageId);
    // In a real implementation, this would download the media
  };

  const handleView = (mediaUrl, mediaType) => {
    // Placeholder for view functionality
    console.log('Viewing media:', mediaUrl, mediaType);
    // In a real implementation, this would open a media viewer
  };

  const renderMessageContent = () => {
    let messageContent;

    // Handle different message types
    if (message.message_type === 'news_share') {
      // News share message
      try {
        const newsData = JSON.parse(message.content);
        messageContent = (
          <div className="news-share-message" onClick={() => window.open(newsData.link, '_blank')}>
            <div className="news-share-header">
              <i className="fas fa-newspaper"></i>
              <span>Shared News</span>
            </div>
            <div className="news-share-content">
              <h4>{newsData.title}</h4>
              <p><strong>{newsData.source}</strong></p>
              <div className="news-share-link">Read Full Article →</div>
            </div>
          </div>
        );
      } catch (e) {
        messageContent = <p className="message-text">{message.content}</p>;
      }
    } else if (message.message_type === 'reminder') {
      // Reminder message
      try {
        const reminderData = JSON.parse(message.content);
        if (reminderData.type === 'reminder_request') {
          messageContent = (
            <div className="reminder-message-card">
              <div className="reminder-header">
                <i className="fas fa-bell reminder-icon"></i>
                <span className="reminder-label">REMINDER REQUEST</span>
              </div>
              <div className="reminder-content">
                <h4 className="reminder-title">{reminderData.title}</h4>
                {reminderData.description && (
                  <p className="reminder-description">{reminderData.description}</p>
                )}
                <div className="reminder-details">
                  <div className="reminder-time">
                    <i className="fas fa-clock"></i>
                    {new Date(reminderData.reminder_time).toLocaleString()}
                  </div>
                  {reminderData.location && (
                    <div className="reminder-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {reminderData.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }
      } catch (e) {
        messageContent = <p><Calendar size={16} /> Reminder message</p>;
      }
    } else if (['image', 'video', 'audio', 'document'].includes(message.message_type)) {
      // Media message
      messageContent = (
        <MediaMessage
          message={message}
          isSent={isSent}
          onDownload={handleDownload}
          onView={handleView}
        />
      );
    } else {
      // Text message
      messageContent = <p className="message-text">{message.content}</p>;
    }

    return messageContent;
  };

  return (
    <div
      className={`message ${isSent ? 'sent' : 'received'} ${isSelected ? 'selected' : ''} ${isReplied ? 'replied' : ''} ${message.is_vanished ? 'vanished' : ''}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!isSelectionMode) {
          setShowActions(!showActions);
        }
      }}
    >
      <div className="message-content">
        {/* Reply indicator */}
        {isReplied && (
          <div className="replied-message-container">
            <div className="replied-message-header">
              <i className="fas fa-reply"></i>
              <span className="replied-message-user">
                {isSent ? 'You' : 'Them'}
              </span>
            </div>
            <div className="replied-message-content">
              {/* Would need to fetch replied message content */}
              Replied message
            </div>
          </div>
        )}

        {/* Message content */}
        {isEditing ? (
          <div className="message-edit">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              autoFocus
            />
            <div className="edit-actions">
              <button onClick={saveEdit}>Save</button>
              <button onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          renderMessageContent()
        )}

        {/* Message time */}
        <span className="message-time">
          {formatTime(message.created_at)}
          {message.edited_at && ' (edited)'}
        </span>

        {/* Vanish timer */}
        {message.vanish_at && !message.is_vanished && (
          <div className="vanish-timer">
            <i className="fas fa-clock"></i>
            <span>Timer</span>
          </div>
        )}

        {/* Message status for sent messages */}
        {isSent && (
          <span className="message-status">
            {message.is_read ? <CheckCheck size={16} /> : <Check size={16} />}
          </span>
        )}

        {/* Message actions dropdown */}
        {showActions && !isSelectionMode && (
          <div className="message-actions">
            <button className="message-arrow-btn"><MoreVertical size={16} /></button>
            <div className="message-dropdown">
              <div className="message-option" onClick={handleReply}>
                <i className="fas fa-reply icon"></i> Reply
              </div>
              <div className="message-option" onClick={handleCopy}>
                <i className="fas fa-copy icon"></i> Copy
              </div>
              <div className="message-option" onClick={handleForward}>
                <i className="fas fa-share icon"></i> Forward
              </div>
              {isSent && (
                <>
                  <div className="message-option" onClick={handleEdit}>
                    <i className="fas fa-edit icon"></i> Edit
                  </div>
                  <div className="message-option danger" onClick={handleDelete}>
                    <i className="fas fa-trash icon"></i> Delete
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;