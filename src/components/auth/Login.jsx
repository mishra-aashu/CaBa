import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import '../../styles/auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check for email verification confirmation
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    if (verified === 'true') {
      setMessage({
        text: 'Email verified successfully! You can now log in.',
        type: 'success'
      });
      // Clean up URL
      const url = new URL(window.location);
      url.searchParams.delete('verified');
      window.history.replaceState({}, '', url);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePhone = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await login('google');
      setMessage({ text: 'Login successful!', type: 'success' });
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      console.error('Google login error:', error);
      setMessage({ text: 'Google login failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phone = formData.phone.trim();
    const password = formData.password;

    // Validation
    if (!validatePhone(phone)) {
      setMessage({ text: 'Please enter a valid 10-digit phone number', type: 'error' });
      return;
    }

    if (!password) {
      setMessage({ text: 'Please enter your password', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await login('phone', { phone, password });
      setMessage({ text: 'Login successful!', type: 'success' });
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Login to your CaBa account</p>
      </div>

      <form id="loginForm" className="auth-form" onSubmit={handleSubmit}>
        {/* Phone */}
        <div className="input-group">
          <label htmlFor="phone">
            <Phone size={16} className="icon" />
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="10 digit mobile number"
            pattern="[0-9]{10}"
            maxLength="10"
            required
            autoComplete="tel"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <small>10 digits without country code</small>
        </div>

        {/* Password */}
        <div className="input-group">
          <label htmlFor="password">
            <Lock size={16} className="icon" />
            Password
          </label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="input-group" style={{ textAlign: 'right', background: 'transparent', border: 'none', boxShadow: 'none', padding: '10px 0' }}>
          <Link to="/forgot-password" style={{ color: 'var(--primary-color)', fontSize: '14px', textDecoration: 'none' }}>
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button type="submit" id="submitBtn" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span>or</span>
      </div>

      {/* Google Login */}
      <button 
        type="button" 
        className="btn btn-google" 
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          background: 'white',
          color: '#3c4043',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '20px',
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      {/* Signup Link */}
      <div className="auth-footer">
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`} style={{
          marginTop: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '14px',
          display: 'block'
        }}>
          {message.text}
        </div>
      )}
      </div>
    </div>
  );
};

export default Login;