import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import '../../styles/auth.css';

const Signup = () => {
  const { signUpWithPhone } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || name.trim().length < 2) {
      setError('Please enter a valid name (minimum 2 characters)');
      setLoading(false);
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await signUpWithPhone(phone, password, name, email);
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join CaBa messaging platform</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              placeholder="Enter your email address"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <small>We'll send a confirmation email to verify your account</small>
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
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="confirmPassword">
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {/* Login Link */}
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
