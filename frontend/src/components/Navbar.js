import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Task Manager</Link>
      </div>
      <div className="navbar-menu">
        {user && (
          <>
            <Link to="/dashboard" className="navbar-item">
              Dashboard
            </Link>
            <Link to="/tasks" className="navbar-item">
              Tasks
            </Link>
            <Link to="/profile" className="navbar-item">
              Profile
            </Link>
            <button onClick={handleLogout} className="navbar-item navbar-button">
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" className="navbar-item">
              Login
            </Link>
            <Link to="/register" className="navbar-item">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;