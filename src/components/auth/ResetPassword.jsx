import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import '../../styles/auth.css';

const ResetPassword = () => {
  const { supabase } = useSupabase();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [tokenValid, setTokenValid] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    setToken(tokenFromUrl);

    if (!tokenFromUrl) {
      setMessage({ text: 'Invalid reset link', type: 'error' });
      return;
    }

    verifyToken(tokenFromUrl);
  }, []);

  const verifyToken = async (token) => {
    try {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('id, user_id, expires_at, is_used')
        .eq('token', token)
        .single();

      if (error || !data) {
        setMessage({ text: 'Invalid or expired reset link', type: 'error' });
        return;
      }

      if (data.is_used) {
        setMessage({ text: 'This reset link has already been used', type: 'error' });
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setMessage({ text: 'This reset link has expired', type: 'error' });
        return;
      }

      // Token is valid
      setTokenValid(true);
      setMessage({ text: 'Please enter your new password', type: 'success' });

    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Error verifying reset link', type: 'error' });
    }
  };

  const hashPassword = async (password) => {
    // Simple hash function (USE BCRYPT IN PRODUCTION!)
    // This is just for demo - USE PROPER HASHING IN PRODUCTION
    // You should hash on server-side using bcrypt
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Get token details
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('user_id')
        .eq('token', token)
        .single();

      if (tokenError) throw tokenError;

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Update user password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', tokenData.user_id);

      if (updateError) throw updateError;

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ is_used: true })
        .eq('token', token);

      setMessage({ text: 'Password reset successful! Redirecting to login...', type: 'success' });

      setTimeout(() => {
        window.location.href = '/index.html';
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Failed to reset password. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (inputId) => {
    const input = document.getElementById(inputId);
    const btn = input.nextElementSibling;

    if (input.type === 'password') {
      input.type = 'text';
      if (btn) btn.querySelector('.eye-icon i').className = 'fas fa-eye-slash';
    } else {
      input.type = 'password';
      if (btn) btn.querySelector('.eye-icon i').className = 'fas fa-eye';
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* App Header */}
        <div className="auth-header">
          <div className="app-logo">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="var(--primary-color)" />
              <text x="40" y="52" fontSize="35" fill="white" textAnchor="middle" fontWeight="bold">DD</text>
            </svg>
          </div>
          <h1 className="app-name">DigiDad</h1>
          <p className="app-tagline">Enter your new password</p>
        </div>

        {/* Reset Password Form */}
        <form id="resetPasswordForm" className="auth-form" onSubmit={handleSubmit}>
          <h2>Reset Password</h2>
          <p className="form-subtitle">Enter your new password</p>

          <div className="input-group">
            <label htmlFor="password">New Password</label>
            <div className="password-input">
              <input
                type="password"
                id="password"
                placeholder="Enter new password"
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!tokenValid}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePassword('password')}
                disabled={!tokenValid}
              >
                <span className="eye-icon"><i className="fas fa-eye"></i></span>
              </button>
            </div>
            <small className="input-hint">At least 6 characters</small>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input">
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                required
                minLength="6"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!tokenValid}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePassword('confirmPassword')}
                disabled={!tokenValid}
              >
                <span className="eye-icon"><i className="fas fa-eye"></i></span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !tokenValid}
          >
            <span className="btn-text">{loading ? 'Resetting...' : 'Reset Password'}</span>
            {loading && <span className="btn-loader" style={{ display: 'inline-block' }}>
              <div className="spinner"></div>
            </span>}
          </button>

          <div id="message" className="message" style={{ display: message.text ? 'block' : 'none' }}>
            {message.text}
          </div>
        </form>

        <div className="auth-switch">
          Remember your password? <a href="/login.html">Login</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;