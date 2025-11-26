import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { callService } from '../services/callService';
import { webRTCService } from '../services/webrtcService';

const CallContext = createContext(null);

// Action Types
const ACTIONS = {
  SET_CALL_STATE: 'SET_CALL_STATE',
  SET_LOCAL_STREAM: 'SET_LOCAL_STREAM',
  SET_REMOTE_STREAM: 'SET_REMOTE_STREAM',
  SET_INCOMING_CALL: 'SET_INCOMING_CALL',
  SET_CALL_DURATION: 'SET_CALL_DURATION',
  TOGGLE_MUTE: 'TOGGLE_MUTE',
  TOGGLE_VIDEO: 'TOGGLE_VIDEO',
  TOGGLE_SPEAKER: 'TOGGLE_SPEAKER',
  RESET_CALL: 'RESET_CALL',
  SET_ERROR: 'SET_ERROR',
  SET_CALLER_INFO: 'SET_CALLER_INFO'
};

// Initial State
const initialState = {
  callState: 'idle', // idle, calling, ringing, connected, ended
  callType: null, // voice, video
  callId: null,
  localStream: null,
  remoteStream: null,
  incomingCall: null,
  callerInfo: null,
  receiverInfo: null,
  isMuted: false,
  isVideoOff: false,
  isSpeakerOn: true,
  callDuration: 0,
  error: null
};

// Reducer
function callReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CALL_STATE:
      return { ...state, callState: action.payload.state, ...action.payload.data };
    case ACTIONS.SET_LOCAL_STREAM:
      return { ...state, localStream: action.payload };
    case ACTIONS.SET_REMOTE_STREAM:
      return { ...state, remoteStream: action.payload };
    case ACTIONS.SET_INCOMING_CALL:
      return { ...state, incomingCall: action.payload, callState: 'ringing' };
    case ACTIONS.SET_CALL_DURATION:
      return { ...state, callDuration: action.payload };
    case ACTIONS.TOGGLE_MUTE:
      return { ...state, isMuted: action.payload };
    case ACTIONS.TOGGLE_VIDEO:
      return { ...state, isVideoOff: action.payload };
    case ACTIONS.TOGGLE_SPEAKER:
      return { ...state, isSpeakerOn: action.payload };
    case ACTIONS.SET_CALLER_INFO:
      return { ...state, callerInfo: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.RESET_CALL:
      return { ...initialState };
    default:
      return state;
  }
}

// Provider Component
export function CallProvider({ children, currentUser }) {
  const [state, dispatch] = useReducer(callReducer, initialState);
  const signalChannelRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const ringtoneRef = useRef(null);

  // Initialize ringtone
  useEffect(() => {
    ringtoneRef.current = new Audio('/sounds/ringtone.mp3');
    ringtoneRef.current.loop = true;
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
      }
    };
  }, []);

  // Play/Stop ringtone
  const playRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.play().catch(console.error);
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, []);

  // Start duration timer
  const startDurationTimer = useCallback(() => {
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      dispatch({ type: ACTIONS.SET_CALL_DURATION, payload: duration });
    }, 1000);
  }, []);

  // Stop duration timer
  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Handle incoming signal
  const handleSignal = useCallback(async (signal) => {
    console.log('📨 Signal received in context:', signal.signal_type);

    if (signal.signal_type === 'offer') {
      // Incoming call
      try {
        const callerInfo = await callService.getUserById(signal.from_user_id);
        dispatch({
          type: ACTIONS.SET_INCOMING_CALL,
          payload: {
            ...signal,
            callerInfo
          }
        });
        dispatch({ type: ACTIONS.SET_CALLER_INFO, payload: callerInfo });
        playRingtone();
      } catch (error) {
        console.error('Error fetching caller info:', error);
      }
    } else {
      // Other signals handled by WebRTC service
      const result = await webRTCService.handleSignal(signal);

      // Mark signal as processed
      await callService.markSignalProcessed(signal.id);
    }
  }, [playRingtone]);

  // Setup WebRTC callbacks
  useEffect(() => {
    webRTCService.onRemoteStream = (stream) => {
      console.log('🔊 Remote stream received in context');
      dispatch({ type: ACTIONS.SET_REMOTE_STREAM, payload: stream });
    };

    webRTCService.onCallEnd = (reason) => {
      console.log('📞 Call ended:', reason);
      stopRingtone();
      stopDurationTimer();
      dispatch({ type: ACTIONS.RESET_CALL });
    };

    webRTCService.onConnectionStateChange = (state) => {
      if (state === 'connected') {
        startDurationTimer();
        dispatch({
          type: ACTIONS.SET_CALL_STATE,
          payload: { state: 'connected' }
        });
      }
    };
  }, [startDurationTimer, stopDurationTimer, stopRingtone]);

  // Subscribe to signals
  useEffect(() => {
    if (currentUser?.id) {
      console.log('🔔 Setting up signal subscription for:', currentUser.id);

      signalChannelRef.current = callService.subscribeToSignals(
        currentUser.id,
        handleSignal
      );

      return () => {
        if (signalChannelRef.current) {
          callService.unsubscribe(signalChannelRef.current);
        }
      };
    }
  }, [currentUser?.id, handleSignal]);

  // Start outgoing call
  const startCall = useCallback(async (receiverId, callType = 'video') => {
    try {
      dispatch({
        type: ACTIONS.SET_CALL_STATE,
        payload: { state: 'calling', data: { callType } }
      });

      // Get receiver info
      const receiverInfo = await callService.getUserById(receiverId);
      dispatch({
        type: ACTIONS.SET_CALL_STATE,
        payload: { state: 'calling', data: { receiverInfo } }
      });

      const { callId, localStream } = await webRTCService.startCall(
        currentUser.id,
        receiverId,
        callType
      );

      dispatch({ type: ACTIONS.SET_LOCAL_STREAM, payload: localStream });
      dispatch({
        type: ACTIONS.SET_CALL_STATE,
        payload: { state: 'calling', data: { callId } }
      });

      return { callId, localStream };
    } catch (error) {
      console.error('❌ Error starting call:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      dispatch({ type: ACTIONS.RESET_CALL });
      throw error;
    }
  }, [currentUser?.id]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    try {
      stopRingtone();
      const { incomingCall } = state;

      if (!incomingCall) {
        throw new Error('No incoming call to answer');
      }

      dispatch({
        type: ACTIONS.SET_CALL_STATE,
        payload: { state: 'connecting' }
      });

      const { localStream, remoteStream } = await webRTCService.answerCall(
        incomingCall.call_id,
        incomingCall.from_user_id,
        currentUser.id,
        incomingCall.signal_data
      );

      dispatch({ type: ACTIONS.SET_LOCAL_STREAM, payload: localStream });
      dispatch({ type: ACTIONS.SET_REMOTE_STREAM, payload: remoteStream });
      dispatch({
        type: ACTIONS.SET_CALL_STATE,
        payload: {
          state: 'connected',
          data: {
            callId: incomingCall.call_id,
            callType: incomingCall.signal_data.callType
          }
        }
      });

      // Mark signal as processed
      await callService.markSignalProcessed(incomingCall.id);

      startDurationTimer();
    } catch (error) {
      console.error('❌ Error answering call:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      dispatch({ type: ACTIONS.RESET_CALL });
      throw error;
    }
  }, [state, currentUser?.id, startDurationTimer, stopRingtone]);

  // Reject incoming call
  const rejectCall = useCallback(async () => {
    try {
      stopRingtone();
      const { incomingCall } = state;

      if (incomingCall) {
        await webRTCService.rejectCall(
          incomingCall.call_id,
          currentUser.id,
          incomingCall.from_user_id
        );
        await callService.markSignalProcessed(incomingCall.id);
      }

      dispatch({ type: ACTIONS.RESET_CALL });
    } catch (error) {
      console.error('❌ Error rejecting call:', error);
      dispatch({ type: ACTIONS.RESET_CALL });
    }
  }, [state, currentUser?.id, stopRingtone]);

  // End current call
  const endCall = useCallback(async () => {
    try {
      stopRingtone();
      stopDurationTimer();
      await webRTCService.endCall(state.callDuration);
      dispatch({ type: ACTIONS.RESET_CALL });
    } catch (error) {
      console.error('❌ Error ending call:', error);
      dispatch({ type: ACTIONS.RESET_CALL });
    }
  }, [state.callDuration, stopRingtone, stopDurationTimer]);

  // Toggle microphone
  const toggleMute = useCallback(() => {
    const isMuted = !webRTCService.toggleMicrophone();
    dispatch({ type: ACTIONS.TOGGLE_MUTE, payload: isMuted });
    return isMuted;
  }, []);

  // Toggle camera
  const toggleVideo = useCallback(() => {
    const isVideoOff = !webRTCService.toggleCamera();
    dispatch({ type: ACTIONS.TOGGLE_VIDEO, payload: isVideoOff });
    return isVideoOff;
  }, []);

  // Switch camera
  const switchCamera = useCallback(async () => {
    const newStream = await webRTCService.switchCamera();
    if (newStream) {
      dispatch({ type: ACTIONS.SET_LOCAL_STREAM, payload: newStream });
    }
  }, []);

  const value = {
    ...state,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
}

// Custom Hook
export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}

export default CallContext;