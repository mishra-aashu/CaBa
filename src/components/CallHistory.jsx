import React from 'react';
import { useCallHistory } from '../hooks/useCallHistory';
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video } from 'lucide-react';

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white">Call History</h2>
        {missedCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {missedCount} missed
          </span>
        )}
      </div>

      {/* Call List */}
      <div className="divide-y dark:divide-gray-700">
        {history.length > 0 ? (
          history.map((call) => (
            <div
              key={call.id}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {call.other_user_avatar ? (
                  <img
                    src={call.other_user_avatar}
                    alt={call.other_user_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {call.other_user_name?.charAt(0) || '?'}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-semibold dark:text-white">
                  {call.other_user_name || 'Unknown'}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {getCallIcon(call)}
                  <span>{call.call_type === 'video' ? 'Video' : 'Voice'}</span>
                  <span>•</span>
                  <span>{formatDuration(call.call_duration)}</span>
                </div>
              </div>

              {/* Time & Call Button */}
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {formatTime(call.started_at)}
                </span>
                <div className="mt-1">
                  {call.call_type === 'video' ? (
                    <Video className="w-5 h-5 text-blue-500 inline" />
                  ) : (
                    <Phone className="w-5 h-5 text-green-500 inline" />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No call history yet
          </div>
        )}
      </div>
    </div>
  );
}

export default CallHistory;