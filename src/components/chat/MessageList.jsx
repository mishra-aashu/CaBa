import React from 'react';
import MessageItem from './MessageItem';

const MessageList = ({
  messages,
  currentUser,
  selectedMessages,
  isSelectionMode,
  onMessageSelect,
  onReply
}) => {
  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach(message => {
      const date = new Date(message.created_at);
      const dateKey = date.toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="messages-wrapper">
      {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
        <React.Fragment key={dateKey}>
          {/* Date Separator */}
          <div className="date-separator">
            <span>{new Date(dateMessages[0].created_at).toLocaleDateString()}</span>
          </div>

          {/* Messages for this date */}
          {dateMessages.map(message => (
            <MessageItem
              key={message.id}
              message={message}
              currentUser={currentUser}
              isSelected={selectedMessages.has(message.id)}
              isSelectionMode={isSelectionMode}
              onSelect={() => onMessageSelect(message.id)}
              onReply={() => onReply(message)}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageList;