import React, { useState } from 'react';
import { forceOpenExternalBrowser } from '../../utils/appDetection';

const BrowserFallback = ({ authUrl, onCancel }) => {
  const [attempted, setAttempted] = useState(false);

  const handleManualOpen = () => {
    setAttempted(true);
    const success = forceOpenExternalBrowser(authUrl);
    
    if (!success) {
      // Show manual instructions
      alert(`Please manually open this URL in your browser:\n\n${authUrl}`);
    }
  };

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(authUrl);
      alert('URL copied to clipboard! Paste it in your browser.');
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = authUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('URL copied to clipboard! Paste it in your browser.');
    }
  };

  return (
    <div style={{
      background: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#856404' }}>
        🌐 Browser Required
      </h3>
      
      <p style={{ margin: '0 0 15px 0', color: '#856404' }}>
        To complete Google authentication, we need to open your browser.
      </p>

      {!attempted ? (
        <div>
          <button 
            className="btn btn-primary" 
            onClick={handleManualOpen}
            style={{ marginRight: '10px' }}
          >
            📱 Open Browser
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleCopyUrl}
          >
            📋 Copy URL
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#856404', marginBottom: '15px' }}>
            ✅ Attempted to open browser. If it didn't work:
          </p>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Manual Steps:</strong>
            <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li>Copy the URL below</li>
              <li>Open your browser (Chrome, Safari, etc.)</li>
              <li>Paste and visit the URL</li>
              <li>Complete Google login</li>
              <li>Return to this app</li>
            </ol>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            wordBreak: 'break-all',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {authUrl}
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleCopyUrl}
            style={{ marginRight: '10px' }}
          >
            📋 Copy URL
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleManualOpen}
          >
            🔄 Try Again
          </button>
        </div>
      )}
      
      <div style={{ marginTop: '15px' }}>
        <button 
          className="btn btn-text" 
          onClick={onCancel}
          style={{ color: '#6c757d' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BrowserFallback;