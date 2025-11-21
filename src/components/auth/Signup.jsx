import React, { useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import '../../styles/auth.css';

const Signup = () => {
  const { supabase } = useSupabase();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, phone, email, password, confirmPassword } = formData;

    // Validation
    if (!name || name.trim().length < 2) {
      setError('Please enter a valid name (minimum 2 characters)');
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Supabase Auth Signup with Email Verification
      console.log('🔧 Attempting signup with:', { email, name, phone });
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            phone: phone
          },
          emailRedirectTo: `${window.location.origin}/login.html?verified=true`
        }
      });

      if (authError) {
        console.error('❌ Auth error:', authError);
        console.error('❌ Auth error details:', {
          message: authError.message,
          status: authError.status,
          code: authError.code
        });

        if (authError.message.includes('already registered')) {
          setError('Email already registered. Please login.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      console.log('✅ Signup successful:', authData);
      console.log('✅ Auth data details:', {
        user: authData.user,
        user_metadata: authData.user?.user_metadata,
        raw_user_meta_data: authData.user?.raw_user_meta_data,
        id: authData.user?.id,
        email: authData.user?.email
      });

      // Step 2: Show verification message
      setShowVerification(true);

    } catch (error) {
      console.error('Signup error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      // Show success message
      alert('Verification email sent! Check your inbox.');
    } catch (error) {
      console.error('Resend error:', error);
      alert('Failed to resend email. Please try again.');
    }
  };

  if (showVerification) {
    return (
      <div className="auth-container">
        <div className="verification-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📧</div>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>
            Verify Your Email
          </h2>
          <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
            We've sent a verification link to:<br />
            <strong style={{ color: '#333' }}>{formData.email}</strong>
          </p>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <p style={{ color: '#555', fontSize: '14px', margin: '0' }}>
              ✉️ Check your inbox (and spam folder)<br />
              🔗 Click the verification link<br />
              ✅ Then login to your account
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/login.html'}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '12px',
            }}
          >
            Go to Login
          </button>
          <button
            onClick={() => resendVerification(formData.email)}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              color: 'var(--primary-color)',
              border: '2px solid var(--primary-color)',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Join CaBa messaging platform</p>
      </div>

      <form id="signupForm" className="auth-form" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="input-group">
          <label htmlFor="name">
            <span className="icon">👤</span>
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your full name"
            required
            autoComplete="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        {/* Phone */}
        <div className="input-group">
          <label htmlFor="phone">
            <span className="icon">📱</span>
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

        {/* Email */}
        <div className="input-group">
          <label htmlFor="email">
            <span className="icon">✉️</span>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="your@email.com"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <small>We'll send a verification link</small>
        </div>

        {/* Password */}
        <div className="input-group">
          <label htmlFor="password">
            <span className="icon">🔒</span>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Minimum 6 characters"
            minLength="6"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        {/* Confirm Password */}
        <div className="input-group">
          <label htmlFor="confirmPassword">
            <span className="icon">🔐</span>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter your password"
            minLength="6"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" id="submitBtn" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        {/* Login Link */}
        <div className="auth-footer">
          <p>Already have an account? <a href="/login.html">Login</a></p>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="error-message" style={{
          background: '#fee',
          color: '#c33',
          padding: '12px 16px',
          borderRadius: '8px',
          marginTop: '16px',
          fontSize: '14px',
          borderLeft: '4px solid #c33',
          animation: 'shake 0.3s'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Signup;