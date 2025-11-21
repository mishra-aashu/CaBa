import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import '../../styles/auth.css';

const Login = () => {
  const { supabase, user } = useSupabase();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Store user data and redirect
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.name || 'User',
          email: session.user.email,
          phone: session.user.user_metadata?.phone || '',
          avatar: session.user.user_metadata?.avatar || null
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        window.location.href = '/home.html';
      }
    };

    checkSession();

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

  const formatPhone = (phone) => {
    if (!phone) return '';
    if (phone.startsWith('+')) return phone;
    const cleaned = phone.replace(/\D/g, '');
    return '+' + cleaned;
  };

  const validatePhone = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^(\+)?\d{1,15}$/;
    return phoneRegex.test(phone);
  };

  const getEmailByPhone = async (phone) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('phone', phone)
        .single();

      if (error) {
        console.error('Error getting email by phone:', error);
        return null;
      }

      return data?.email || null;
    } catch (error) {
      console.error('Error in getEmailByPhone:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phone = formatPhone(formData.phone.trim());
    const password = formData.password;

    // Validation
    if (!validatePhone(phone)) {
      setMessage({ text: 'Invalid phone number', type: 'error' });
      return;
    }

    if (!password) {
      setMessage({ text: 'Please enter your password', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      console.log('🔧 Attempting login for phone:', phone);

      // Get email by phone from database
      const email = await getEmailByPhone(phone);
      console.log('🔧 Email retrieved for phone:', phone, '->', email);

      if (!email) {
        console.error('❌ No email found for phone:', phone);
        setMessage({ text: 'Phone number not registered', type: 'error' });
        setLoading(false);
        return;
      }

      console.log('🔧 Logging in with email:', email);

      // Login with Supabase Auth using real email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      console.log('🔧 Login response:', { data: data ? 'success' : null, error });

      if (error) throw error;

      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        setMessage({
          text: 'Please verify your email first by clicking the confirmation link sent to your email.',
          type: 'error'
        });
        setLoading(false);
        return;
      }

      // Store user data
      const userData = {
        id: data.user.id,
        name: data.user.user_metadata?.name || 'User',
        email: data.user.email,
        phone: data.user.user_metadata?.phone || '',
        avatar: data.user.user_metadata?.avatar || null
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));

      // Update user online status and log login
      await supabase
        .from('users')
        .update({
          is_online: true,
          last_seen: new Date().toISOString()
        })
        .eq('id', data.user.id);

      // Log successful login
      try {
        await supabase
          .from('login_history')
          .insert([{
            user_id: data.user.id,
            phone: phone,
            email: data.user.email,
            success: true,
            action: 'login',
            created_at: new Date().toISOString()
          }]);
      } catch (logError) {
        console.error('Failed to log login:', logError);
      }

      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });

      setTimeout(() => {
        window.location.href = '/home.html';
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);

      if (error.message.includes('Invalid login credentials')) {
        setMessage({ text: 'Invalid phone number or password', type: 'error' });
      } else {
        setMessage({ text: error.message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Login to your CaBa account</p>
      </div>

      <form id="loginForm" className="auth-form" onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        {/* Forgot Password */}
        <div className="input-group" style={{ textAlign: 'right', background: 'transparent', border: 'none', boxShadow: 'none', padding: '10px 0' }}>
          <a href="/forgot-password.html" style={{ color: 'var(--primary-color)', fontSize: '14px', textDecoration: 'none' }}>
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button type="submit" id="submitBtn" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Signup Link */}
        <div className="auth-footer">
          <p>Don't have an account? <a href="/signup.html">Sign Up</a></p>
        </div>
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
    </div>
  );
};

export default Login;