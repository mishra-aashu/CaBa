import React, { useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const AuthErrorHandler = ({ error, onRetry, onDismiss }) => {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  useEffect(() => {
    // Auto-dismiss network-related errors when connection is restored
    if (isOnline && error && (error.includes('network') || error.includes('connection'))) {
      const timer = setTimeout(() => {
        onDismiss && onDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, error, onDismiss]);

  if (!error) return null;

  const getErrorMessage = () => {
    if (!isOnline) {
      return 'You are offline. Please check your internet connection.';
    }

    if (isSlowConnection) {
      return 'Slow network detected. Authentication may take longer.';
    }

    if (error.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    if (error.includes('network')) {
      return 'Network error occurred. Please check your connection.';
    }

    if (error.includes('Google')) {
      return error;
    }

    if (error.includes('session')) {
      return 'Session expired. Please login again.';
    }

    return error || 'An authentication error occurred.';
  };

  const getErrorType = () => {
    if (!isOnline) return 'offline';
    if (error.includes('Google')) return 'google';
    if (error.includes('timeout') || error.includes('network')) return 'network';
    return 'general';
  };

  const errorType = getErrorType();
  const message = getErrorMessage();

  return (
    <div className={`auth-error ${errorType}`}>
      <div className="error-icon">
        {errorType === 'offline' && '🌐'}
        {errorType === 'network' && '⚠️'}
        {errorType === 'google' && '🔴'}
        {errorType === 'general' && '❌'}
      </div>
      <div className="error-message">{message}</div>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default AuthErrorHandler;