import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import './Auth.css';
import Visibility from '@mui/icons-material/Visibility'; // Import MUI icons
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member',
  });
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Separate state for confirm password visibility
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword, role } = formData;

  const onChange = e => {
    const { name, value, type, checked } = e.target;

    // Update formData and dynamically set the role based on isAdmin
    setFormData(prevState => {
      const updatedFormData = {
        ...prevState,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Dynamically set the role based on isAdmin
      if (name === 'isAdmin') {
        updatedFormData.role = checked ? 'admin' : 'member';
      }

      return updatedFormData;
    });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.register({
        name,
        email,
        password,
        role,
      });
      login(userData, userData.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleShowPassword}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleShowConfirmPassword}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>
          <div className="form-group checkbox-group">
            <label htmlFor="isAdmin" className="checkbox-label">
              Register as Admin
            </label>
            <input
              type="checkbox"
              id="isAdmin"
              name="isAdmin"
              checked={role === 'admin'} // ✅ convert role string to boolean
              onChange={onChange}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
