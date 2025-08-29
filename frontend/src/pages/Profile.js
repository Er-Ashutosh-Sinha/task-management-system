import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-role">
              Role: <span className={`role-${user?.role}`}>{user?.role}</span>
            </p>
          </div>
        </div>
        <div className="profile-details">
          <h3>Account Details</h3>
          <div className="detail-item">
            <span className="detail-label">User ID:</span>
            <span className="detail-value">{user?._id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Member Since:</span>
            <span className="detail-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Updated:</span>
            <span className="detail-value">
              {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;