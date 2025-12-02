import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { User, Phone, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import '../../styles/auth.css';

// Google Icon Component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [showPhoneCollection, setShowPhoneCollection] = useState(false);

  // Check for Google OAuth completion
  useEffect(() => {
    const checkGoogleCompletion = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const googleComplete = urlParams.get('google_complete');

      if (googleComplete === 'true') {
        // Get current user data
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user && !error) {
          // Check if user already exists in database
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (existingUser) {
            // User already exists, redirect to main app
            window.location.href = '/CaBa/';
            return;
          }

          // User needs to complete phone number
          setGoogleUserData({
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            email: user.email,
            avatar: user.user_metadata?.avatar_url || null
          });
          setShowPhoneCollection(true);

          // Clean up URL
          const url = new URL(window.location);
          url.searchParams.delete('google_complete');
          window.history.replaceState({}, '', url);
        }
      }
    };

    checkGoogleCompletion();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          emailRedirectTo: `${window.location.origin}/CaBa/login?verified=true`
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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/CaBa/signup?google_complete=true`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        setError('Failed to sign in with Google. Please try again.');
        setLoading(false);
      }
      // Note: The page will redirect to Google, so we don't need to handle the success case here

    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('An error occurred during Google sign-in.');
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    const phone = formData.phone.trim();

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create user record in database with Google data + phone
      const { error: dbError } = await supabase
        .from('users')
        .insert([{
          id: googleUserData.id,
          name: googleUserData.name,
          email: googleUserData.email,
          phone: phone,
          avatar: googleUserData.avatar,
          created_at: new Date().toISOString()
        }]);

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Failed to complete signup. Please try again.');
        return;
      }

      // Success - redirect to main app
      setMessage({ text: 'Account created successfully! Redirecting...', type: 'success' });
      setTimeout(() => {
        window.location.href = '/CaBa/';
      }, 1000);

    } catch (error) {
      console.error('Phone submission error:', error);
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
      <div className="auth-page">
        <div className="auth-container">
        <div className="verification-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', color: 'var(--primary-color)' }}>
            <Mail size={64} />
          </div>
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
          <Link
            to="/login"
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
              display: 'inline-block',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            Go to Login
          </Link>
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
      </div>
    );
  }

  // Phone Collection for Google OAuth users
  if (showPhoneCollection && googleUserData) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Complete Your Profile</h1>
            <p>Just need your phone number to finish setting up your account</p>
          </div>

          <div className="google-user-info">
            <div className="user-avatar">
              {googleUserData.avatar ? (
                <img src={googleUserData.avatar} alt={googleUserData.name} />
              ) : (
                googleUserData.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="user-details">
              <h3>{googleUserData.name}</h3>
              <p>{googleUserData.email}</p>
            </div>
          </div>

          <form id="phoneForm" className="auth-form" onSubmit={handlePhoneSubmit}>
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

            <button type="submit" id="phoneSubmitBtn" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Signup'}
            </button>
          </form>

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
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Join CaBa messaging platform</p>
      </div>

      {/* Google Sign In Button */}
      <button
        type="button"
        className="btn-google"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="auth-divider">
        <span>or</span>
      </div>

      <form id="signupForm" className="auth-form" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="input-group">
          <label htmlFor="name">
            <User size={16} className="icon" />
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

        {/* Email */}
        <div className="input-group">
          <label htmlFor="email">
            <Mail size={16} className="icon" />
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
            <Lock size={16} className="icon" />
            Password
          </label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Minimum 6 characters"
              minLength="6"
              required
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div className="input-group">
          <label htmlFor="confirmPassword">
            <Shield size={16} className="icon" />
            Confirm Password
          </label>
          <div className="password-input">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter your password"
              minLength="6"
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" id="submitBtn" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        {/* Login Link */}
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
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
    </div>
  );
};

export default Signup;