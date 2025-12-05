import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import './QRCodeGenerator.css';

const QRCodeGenerator = ({ userId, userName, userPhone, onDownload, onClose }) => {
  const canvasRef = useRef(null);
  const [qrData, setQrData] = useState('');
  const [qrDataURL, setQrDataURL] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for component to mount and canvas to be available
    const timer = setTimeout(() => {
      generateQRCode();
    }, 100); // Small delay to ensure canvas is rendered

    return () => clearTimeout(timer);
  }, [userId]);

  const generateQRCode = async () => {
    try {
      setLoading(true);

      // Validate required data
      if (!userId) {
        throw new Error('User ID is required');
      }

      const profileUrl = `${window.location.origin}/shared-profile.html?userId=${userId}`;

      // Enhanced QR data with user information
      const qrDataString = JSON.stringify({
        type: 'caba_profile',
        userId: userId,
        userName: userName || 'User',
        userPhone: userPhone || '',
        url: profileUrl,
        timestamp: Date.now()
      });

      console.log('Generating QR code with data:', qrDataString);
      setQrData(qrDataString);

      // Wait for canvas to be available with retry mechanism
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, qrDataString, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          console.log('QR code generated successfully');

          // Set the data URL for display
          const dataURL = canvasRef.current.toDataURL();
          setQrDataURL(dataURL);

          setLoading(false);
          return;
        }

        // Wait 100ms before next attempt
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      throw new Error('Canvas element not found after multiple attempts');

    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${userName}-CaBa-QR.png`;
        link.href = canvas.toDataURL();
        link.click();

        if (onDownload) {
          onDownload();
        }
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code');
    }
  };


  return (
    <div className="qr-generator-modal">
      <div className="qr-generator-content">
        <div className="qr-generator-header">
          <h3>My QR Code</h3>
          <button className="qr-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="qr-generator-body">
          {loading ? (
            <div className="qr-loading">
              <div className="spinner"></div>
              <p>Generating QR Code...</p>
            </div>
          ) : (
            <>
              <div className="qr-canvas-container">
                <img
                  src={qrDataURL}
                  alt="QR Code"
                  className="qr-canvas"
                  style={{ width: '256px', height: '256px' }}
                />
              </div>

              <div className="qr-info">
                <p className="qr-title">{userName}</p>
                {userPhone && <p className="qr-phone">📱 {userPhone}</p>}
                <p className="qr-description">
                  Scan this QR code to view my CaBa profile
                </p>
              </div>

              <div className="qr-actions">
                <button className="qr-download-btn" onClick={handleDownload}>
                  <i className="fas fa-download"></i>
                  Download QR
                </button>
                <button className="qr-share-btn" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${userName} - CaBa Profile`,
                      text: `Connect with ${userName} on CaBa!`,
                      url: `${window.location.origin}/shared-profile.html?userId=${userId}`
                    });
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/shared-profile.html?userId=${userId}`)
                      .then(() => alert('Profile link copied to clipboard!'));
                  }
                }}>
                  <i className="fas fa-share"></i>
                  Share Link
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;