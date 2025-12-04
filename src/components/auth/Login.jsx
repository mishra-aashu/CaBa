import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../hooks/useAuth';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import '../../styles/auth.css';

const Login = () => {
  const { supabase } = useSupabase();
  const { customLogin } = useAuth();
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

  const getUserByPhone = async (phone) => {
    try {
      // Normalize phone number (remove + if present for database lookup)
      const normalizedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', normalizedPhone)
        .single();

      if (error) {
        console.error('Error getting user by phone:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getUserByPhone:', error);
      return null;
    }
  };

  const verifyPassword = async (password, storedPassword) => {
    // Simple password comparison - in production, use proper hashing
    return password === storedPassword;
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

      // Get user by phone from database
      const user = await getUserByPhone(phone);
      console.log('🔧 User retrieved for phone:', phone, '->', user);

      if (!user) {
        console.error('❌ No user found for phone:', phone);
        setMessage({ text: 'Phone number not registered', type: 'error' });
        setLoading(false);
        return;
      }

      // Try Supabase Auth first
      let authData = null;
      let authError = null;
      
      if (user.email && user.email.trim()) {
        console.log('🔧 Trying Supabase Auth with email:', user.email);
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: password
          });

          authData = data;
          authError = error;
          console.log('🔧 Auth response:', { data: data ? 'success' : null, error });
        } catch (supabaseError) {
          console.log('🔧 Supabase Auth error:', supabaseError);
          authError = supabaseError;
        }
      } else {
        console.log('🔧 User has no email, skipping Supabase Auth');
      }

      // If Supabase Auth failed, try custom password verification
      if (authError || !user.email) {
        console.log('🔧 Supabase Auth failed, checking custom password...');
        
        if (!user.password) {
          console.error('❌ No password found for user:', phone);
          setMessage({ text: 'Account setup incomplete. Please sign up again.', type: 'error' });
          setLoading(false);
          return;
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
          console.error('❌ Invalid password for phone:', phone);
          setMessage({ text: 'Invalid phone number or password', type: 'error' });
          setLoading(false);
          return;
        }

        // Custom login successful - use universal auth
        console.log('🔧 Custom login successful for phone:', phone);
        
        // Use the centralized authentication system
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        };
        
        customLogin(userData);

        // Update user online status for custom auth
        await supabase
          .from('users')
          .update({
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', user.id);

        // Log successful login
        try {
          await supabase
            .from('login_history')
            .insert([{
              user_id: user.id,
              phone: phone,
              success: true,
              action: 'login',
              created_at: new Date().toISOString()
            }]);
        } catch (logError) {
          console.error('Failed to log login:', logError);
        }

        setMessage({ text: 'Login successful!', type: 'success' });

        // Navigate to home page after successful login
        setTimeout(() => {
          navigate('/');
        }, 500);
        
        setLoading(false);
        return;
      }

      // Supabase Auth was successful
      if (authError) {
        throw authError;
      }

      // Use the centralized authentication system for Supabase Auth
      const userData = {
        id: authData.user.id,
        name: authData.user.user_metadata?.name || authData.user.name || 'User',
        email: authData.user.user_metadata?.email || authData.user.email || '',
        phone: authData.user.user_metadata?.phone || authData.user.phone || '',
        avatar: authData.user.user_metadata?.avatar || authData.user.avatar || null
      };
      
      customLogin(userData);

      // Update user online status and log login
      await supabase
        .from('users')
        .update({
          is_online: true,
          last_seen: new Date().toISOString()
        })
        .eq('id', authData.user.id);

      // Log successful login
      try {
        await supabase
          .from('login_history')
          .insert([{
            user_id: authData.user.id,
            phone: phone,
            email: authData.user.email || '',
            success: true,
            action: 'login',
            created_at: new Date().toISOString()
          }]);
      } catch (logError) {
        console.error('Failed to log login:', logError);
      }

      setMessage({ text: 'Login successful!', type: 'success' });

      // Navigate to home page after successful login
      setTimeout(() => {
        navigate('/');
      }, 500);

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

        {/* Signup Link */}
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
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
    </div>
  );
};

export default Login;