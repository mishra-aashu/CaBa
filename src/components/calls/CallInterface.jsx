import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import { useTheme } from '../../contexts/ThemeContext';

const CallInterface = ({ contact, callType, incoming = false, callId, roomId, onClose, onCallEnd }) => {
  const { theme } = useTheme();
  const [callState, setCallState] = useState(incoming ? 'incoming' : 'connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'voice');
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callInstanceRef = useRef(null);

  useEffect(() => {
    if (incoming) {
      initializeIncomingCall();
    } else {
      initializeOutgoingCall();
    }
    return () => {
      if (callInstanceRef.current) {
        callInstanceRef.current.endCall();
      }
    };
  }, []);

  const initializeOutgoingCall = async () => {
    try {
      // Check if WebRTCCall is available
      if (!window.WebRTCCall) {
        alert('WebRTC not loaded. Please refresh the page.');
        onClose();
        return;
      }

      const callInstance = new window.WebRTCCall();

      callInstanceRef.current = callInstance;

      const result = await callInstance.startCall(contact.id, callType, {
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        },
        onCallEnd: (data) => {
          console.log('Call ended:', data);
          setCallState('ended');
          onCallEnd && onCallEnd(data);
          setTimeout(() => onClose(), 2000);
        },
        onStateChange: (type, value) => {
          if (type === 'state') {
            setCallState(value);
          } else if (type === 'timer') {
            setCallDuration(value);
          }
        }
      });

      if (result.success) {
        setLocalStream(result.localStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = result.localStream;
        }
      } else {
        alert('Failed to start call: ' + result.error);
        onClose();
      }

    } catch (error) {
      console.error('Call initialization error:', error);
      alert('Failed to initialize call');
      onClose();
    }
  };

  const initializeIncomingCall = async () => {
    try {
      if (!window.WebRTCCall) {
        alert('WebRTC not loaded. Please refresh the page.');
        onClose();
        return;
      }

      const callInstance = new window.WebRTCCall();
      callInstanceRef.current = callInstance;

      const result = await callInstance.answerCall(callId, roomId, callType, {
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        },
        onCallEnd: (data) => {
          console.log('Call ended:', data);
          setCallState('ended');
          onCallEnd && onCallEnd(data);
          setTimeout(() => onClose(), 2000);
        },
        onStateChange: (type, value) => {
          if (type === 'state') {
            setCallState(value);
          } else if (type === 'timer') {
            setCallDuration(value);
          }
        }
      });

      if (result.success) {
        setLocalStream(result.localStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = result.localStream;
        }
      } else {
        alert('Failed to answer call: ' + result.error);
        onClose();
      }

    } catch (error) {
      console.error('Incoming call initialization error:', error);
      alert('Failed to answer call');
      onClose();
    }
  };

  const handleEndCall = () => {
    if (callInstanceRef.current) {
      callInstanceRef.current.endCall();
    }
    onClose();
  };

  const handleToggleMute = () => {
    if (callInstanceRef.current) {
      const muted = callInstanceRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleToggleVideo = () => {
    if (callInstanceRef.current) {
      const videoOff = callInstanceRef.current.toggleVideo();
      setIsVideoOff(videoOff);
    }
  };

  const handleSwitchCamera = () => {
    if (callInstanceRef.current) {
      callInstanceRef.current.switchCamera();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-interface-overlay">
      <div className="call-interface">
        {/* Remote Video */}
        <div className="remote-video-container">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
          ) : (
            <div className="remote-placeholder">
              <div className="contact-avatar-large">
                <div className="avatar-circle-large">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} />
                  ) : (
                    contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  )}
                </div>
              </div>
              <h2>{contact.name}</h2>
              <p className="call-status">
                {callState === 'calling' && 'Calling...'}
                {callState === 'ringing' && 'Ringing...'}
                {callState === 'answered' && `Connected • ${formatDuration(callDuration)}`}
                {callState === 'ended' && 'Call ended'}
              </p>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {localStream && callType === 'video' && !isVideoOff && (
          <div className="local-video-pip">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
            />
          </div>
        )}

        {/* Call Controls */}
        <div className="call-controls">
          <button
            className={`control-btn ${isMuted ? 'active' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>

          {callType === 'video' && (
            <>
              <button
                className={`control-btn ${isVideoOff ? 'active' : ''}`}
                onClick={handleToggleVideo}
                title={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
              </button>

              <button
                className="control-btn"
                onClick={handleSwitchCamera}
                title="Switch camera"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </>
          )}

          <button
            className="control-btn end-call"
            onClick={handleEndCall}
            title="End call"
          >
            <i className="fas fa-phone-slash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;