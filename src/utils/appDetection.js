// Detect if app is running in AppGeyser or similar webview
export const isInWebView = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check for common webview indicators
  const webviewIndicators = [
    'wv', // Android WebView
    'AppGeyser',
    'WebView',
    'Mobile/',
    'Version/' // iOS WebView
  ];
  
  return webviewIndicators.some(indicator => 
    userAgent.includes(indicator)
  ) || window.navigator.standalone === true;
};

// Check if external browser is available
export const canOpenExternalBrowser = () => {
  return typeof window !== 'undefined' && 
         (window.open || window.location);
};

// Generate unique session ID for cross-browser auth
export const generateSessionId = () => {
  return 'auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};