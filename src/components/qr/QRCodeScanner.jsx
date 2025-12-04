import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './QRCodeScanner.css';

const QRCodeScanner = ({ onScan, onClose, onError }) => {
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeScanner();
    return () => {
      cleanupScanner();
    };
  }, []);

  const initializeScanner = () => {
    try {
      setError('');
      setIsScanning(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment"
        }
      };

      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
      );

      html5QrcodeScannerRef.current.render(
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Ignore frequent scan errors
          if (!errorMessage.includes('No QR code found')) {
            console.warn('QR scan error:', errorMessage);
          }
        }
      );

    } catch (err) {
      console.error('Error initializing QR scanner:', err);
      setError('Failed to initialize camera. Please check camera permissions.');
      setIsScanning(false);
      if (onError) {
        onError(err);
      }
    }
  };

  const handleScanSuccess = (decodedText, decodedResult) => {
    try {
      // Stop scanning immediately
      cleanupScanner();
      setIsScanning(false);

      let scannedData;
      
      try {
        // Try to parse as JSON first (our CaBa QR format)
        scannedData = JSON.parse(decodedText);
      } catch (e) {
        // If not JSON, treat as plain URL
        scannedData = {
          type: 'url',
          url: decodedText
        };
      }

      if (onScan) {
        onScan(scannedData);
      }

    } catch (error) {
      console.error('Error processing QR scan result:', error);
      setError('Invalid QR code format');
    }
  };

  const cleanupScanner = () => {
    if (html5QrcodeScannerRef.current) {
      try {
        html5QrcodeScannerRef.current.clear();
      } catch (error) {
        console.warn('Error cleaning up QR scanner:', error);
      }
      html5QrcodeScannerRef.current = null;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Handle file upload for QR scanning
        // Note: html5-qrcode library would need additional setup for file scanning
        alert('File upload QR scanning coming soon!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="qr-scanner-modal">
      <div className="qr-scanner-content">
        <div className="qr-scanner-header">
          <h3>Scan QR Code</h3>
          <button className="qr-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="qr-scanner-body">
          {error ? (
            <div className="qr-error">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button className="qr-retry-btn" onClick={initializeScanner}>
                <i className="fas fa-redo"></i>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="qr-reader-container">
                <div id="qr-reader" ref={scannerRef} className="qr-reader"></div>
              </div>
              
              <div className="qr-scanner-info">
                <p>Position the QR code within the frame</p>
                <div className="qr-scanner-tips">
                  <div className="tip">
                    <i className="fas fa-lightbulb"></i>
                    <span>Ensure good lighting</span>
                  </div>
                  <div className="tip">
                    <i className="fas fa-hand-paper"></i>
                    <span>Hold steady</span>
                  </div>
                </div>
              </div>
              
              <div className="qr-scanner-actions">
                <label className="qr-upload-btn">
                  <i className="fas fa-upload"></i>
                  Upload from Gallery
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;