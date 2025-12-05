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
  
  // Force webview mode for testing (remove in production)
  const isTestMode = window.location.search.includes('webview=true');
  
  const isWebView = webviewIndicators.some(indicator => 
    userAgent.includes(indicator)
  ) || window.navigator.standalone === true || isTestMode;
  
  console.log('📱 WebView Detection:', {
    userAgent,
    isWebView,
    isTestMode,
    indicators: webviewIndicators.filter(i => userAgent.includes(i))
  });
  
  return isWebView;
};

// Check if external browser is available
export const canOpenExternalBrowser = () => {
  const canOpen = typeof window !== 'undefined' && 
         (window.open || window.location);
  
  console.log('🌐 External browser availability:', canOpen);
  return canOpen;
};

// Force open external browser with multiple methods
export const forceOpenExternalBrowser = (url) => {
  console.log('🚀 Force opening external browser:', url);
  
  // Method 1: Try intent URL for Android
  if (navigator.userAgent.includes('Android')) {
    try {
      const intentUrl = `intent://${url.replace(/https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      console.log('✅ Tried Android intent URL');
      return true;
    } catch (e) {
      console.log('❌ Android intent failed:', e.message);
    }
  }
  
  // Method 2: Try custom protocol
  try {
    window.location.href = `googlechrome://navigate?url=${encodeURIComponent(url)}`;
    console.log('✅ Tried Chrome protocol');
    return true;
  } catch (e) {
    console.log('❌ Chrome protocol failed:', e.message);
  }
  
  // Method 3: Direct redirect
  try {
    window.location.href = url;
    console.log('✅ Direct redirect');
    return true;
  } catch (e) {
    console.log('❌ Direct redirect failed:', e.message);
    return false;
  }
};

// Generate unique session ID for cross-browser auth
export const generateSessionId = () => {
  const sessionId = 'auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  console.log('🎫 Generated session ID:', sessionId);
  return sessionId;
};