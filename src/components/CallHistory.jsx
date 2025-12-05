import React from 'react';
import { useCallHistory } from '../hooks/useCallHistory';
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video } from 'lucide-react';
import '../styles/pro-cards.css';

export function CallHistory({ userId }) {
  const { history, loading, error, missedCount } = useCallHistory(userId);

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getCallIcon = (call) => {
    const isOutgoing = call.caller_id === userId;
    const isMissed = call.call_status === 'missed';
    const isVideo = call.call_type === 'video';

    if (isMissed) {
      return <PhoneMissed className="w-5 h-5 text-red-500" />;
    }
    if (isOutgoing) {
      return <PhoneOutgoing className="w-5 h-5 text-green-500" />;
    }
    return <PhoneIncoming className="w-5 h-5 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Error loading call history
      </div>
    );
  }

  return (
    <div className="call-history-container">
      {/* Header */}
      <div className="call-history-header">
        <h2>Call History</h2>
        {missedCount > 0 && (
          <span className="missed-badge">
            {missedCount} missed
          </span>
        )}
      </div>

      {/* Call List */}
      <div className="call-history-list">
        {history.length > 0 ? (
          history.map((call) => (
            <div key={call.id} className="call-card">
              {/* Avatar */}
              <div className="call-avatar">
                {call.other_user_avatar ? (
                  <img
                    src={call.other_user_avatar}
                    alt={call.other_user_name}
                  />
                ) : (
                  <div>
                    {call.other_user_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="call-info">
                <h3 className="call-name">
                  {call.other_user_name || 'Unknown'}
                </h3>
                <div className="call-details">
                  <div className="call-icon">
                    {getCallIcon(call)}
                  </div>
                  <span className="call-type-badge">
                    {call.call_type === 'video' ? 'Video' : 'Voice'}
                  </span>
                  <span className="call-duration">
                    {formatDuration(call.call_duration)}
                  </span>
                </div>
              </div>

              {/* Time & Call Button */}
              <div className="call-meta">
                <span className="call-time">
                  {formatTime(call.started_at)}
                </span>
                <button className="call-action" title="Call back">
                  {call.call_type === 'video' ? (
                    <Video size={20} />
                  ) : (
                    <Phone size={20} />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Phone size={64} />
            <h3>No call history yet</h3>
            <p>Your call history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CallHistory;