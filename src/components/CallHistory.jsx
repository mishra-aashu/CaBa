import React from 'react';
import { useCallHistory } from '../hooks/useCallHistory';
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video } from 'lucide-react';
import '../styles/clean-cards.css';

export function CallHistory({ userId, userAvatar, userName }) {
  const { history, loading, error, missedCount } = useCallHistory(userId);

  // DP options for avatar display - same as Home component
  const baseUrl = import.meta.env.BASE_URL || '/';
  const dpOptions = [
    { "id": 1, "path": `${baseUrl}assets/images/dp-options/00701602b0eac0390b3107b9e2a665e0.jpg` },
    { "id": 2, "path": `${baseUrl}assets/images/dp-options/1691130988954.jpg` },
    { "id": 3, "path": `${baseUrl}assets/images/dp-options/aesthetic-cartoon-funny-dp-for-instagram.webp` },
    { "id": 4, "path": `${baseUrl}assets/images/dp-options/boy-cartoon-dp-with-hoodie.webp` },
    { "id": 5, "path": `${baseUrl}assets/images/dp-options/download (1).jpg` },
    { "id": 6, "path": `${baseUrl}assets/images/dp-options/download.jpg` },
    { "id": 7, "path": `${baseUrl}assets/images/dp-options/funny-profile-picture-wd195eo9rpjy7ax1.jpg` },
    { "id": 8, "path": `${baseUrl}assets/images/dp-options/funny-whatsapp-dp-for-girls.webp` },
    { "id": 9, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575118_y.jpg` },
    { "id": 10, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575119_y.jpg` },
    { "id": 11, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575120_y.jpg` },
    { "id": 12, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575121_y.jpg` },
    { "id": 13, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575122_y.jpg` },
    { "id": 14, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575123_y.jpg` },
    { "id": 15, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575124_y.jpg` },
    { "id": 16, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575125_y.jpg` },
    { "id": 17, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575126_y.jpg` },
    { "id": 18, "path": `${baseUrl}assets/images/dp-options/photo_5230962651624575127_y.jpg` },
    { "id": 19, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267708_w.jpg` },
    { "id": 20, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267709_w.jpg` },
    { "id": 21, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267710_w.jpg` },
    { "id": 22, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267711_w.jpg` },
    { "id": 23, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267712_w.jpg` },
    { "id": 24, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267713_w.jpg` },
    { "id": 25, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267714_w.jpg` },
    { "id": 26, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267715_w.jpg` },
    { "id": 27, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267716_w.jpg` },
    { "id": 28, "path": `${baseUrl}assets/images/dp-options/photo_5235923888607267717_w.jpg` }
  ];

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
    <div className="call-history-wrapper">
      <div className="call-history-card">
        {/* Header */}
        <div className="call-history-header">
          <div className="header-content">
            <h2 className="call-history-title">Call History</h2>
            {missedCount > 0 && (
              <span className="missed-calls-badge">
                {missedCount} missed
              </span>
            )}
          </div>
          {userAvatar && (
            <div className="user-avatar-header">
              <div className="avatar-circle">
                {userAvatar ? (
                  parseInt(userAvatar) ? (
                    <img src={dpOptions.find(dp => dp.id === parseInt(userAvatar))?.path || userAvatar} alt={userName || 'User'} />
                  ) : (
                    <img src={userAvatar} alt={userName || 'User'} />
                  )
                ) : (
                  userName?.charAt(0) || '?'
                )}
              </div>
            </div>
          )}
        </div>

        {/* Call List */}
        <div>
          {history.length > 0 ? (
            history.map((call) => (
              <div key={call.id} className="call-item">
                {/* Avatar */}
                <div className="call-avatar">
                  {call.other_user_avatar ? (
                    parseInt(call.other_user_avatar) ? (
                      <img
                        src={dpOptions.find(dp => dp.id === parseInt(call.other_user_avatar))?.path || call.other_user_avatar}
                        alt={call.other_user_name}
                      />
                    ) : (
                      <img
                        src={call.other_user_avatar}
                        alt={call.other_user_name}
                      />
                    )
                  ) : (
                    call.other_user_name?.charAt(0) || '?'
                  )}
                </div>

                {/* Info */}
                <div className="call-details">
                  <h3 className="call-name">
                    {call.other_user_name || 'Unknown'}
                  </h3>
                  <div className="call-status-row">
                    {call.call_status === 'missed' ? (
                      <PhoneMissed size={14} className="status-icon missed" />
                    ) : call.caller_id === userId ? (
                      <PhoneOutgoing size={14} className="status-icon outgoing" />
                    ) : (
                      <PhoneIncoming size={14} className="status-icon incoming" />
                    )}
                    <span className="call-time-text">{formatTime(call.started_at)}</span>
                  </div>
                </div>

                {/* Call Button */}
                <button className="call-action-btn" onClick={() => window.location.href = `/call/${call.other_user_id}`}>
                  {call.call_type === 'video' ? (
                    <Video size={22} />
                  ) : (
                    <Phone size={22} />
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Phone size={48} />
              <h3>No call history</h3>
              <p>Your calls will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CallHistory;