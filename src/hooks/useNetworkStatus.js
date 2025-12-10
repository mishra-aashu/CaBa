import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      detectConnectionType();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionType('offline');
    };

    const detectConnectionType = () => {
      if (!navigator.connection) {
        setConnectionType('unknown');
        return;
      }

      const connection = navigator.connection;
      if (connection.effectiveType) {
        setConnectionType(connection.effectiveType);
      } else if (connection.type) {
        setConnectionType(connection.type);
      } else {
        setConnectionType('unknown');
      }
    };

    // Initial detection
    detectConnectionType();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection type changes if available
    if (navigator.connection) {
      navigator.connection.addEventListener('change', detectConnectionType);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', detectConnectionType);
      }
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: !isOnline || connectionType === 'slow-2g' || connectionType === '2g'
  };
};