import React from 'react';
import './RightSidebar.css';

function RightSidebar({ user }) {
  // Mock suggested users (you can later fetch from Firebase)
  const suggestedUsers = [
    { username: 'photo_lover_23', name: 'Photo Lover', followed: false },
    { username: 'creative_snaps', name: 'Creative Snaps', followed: false },
    { username: 'daily_moments', name: 'Daily Moments', followed: false },
    { username: 'snapshot_pro', name: 'Snapshot Pro', followed: false },
    { username: 'pixel_perfect', name: 'Pixel Perfect', followed: false }
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const displayName = user?.displayName || 'User';
  const username = user?.email?.split('@')[0] || 'user';

  return (
    <div className="right-sidebar">
      <div className="user-profile-section">
        <div className="user-profile-info">
          <div className="user-avatar-large">
            {getInitials(displayName)}
          </div>
          <div className="user-details">
            <span className="user-username">{username}</span>
            <span className="user-fullname">{displayName}</span>
          </div>
        </div>
        <button className="switch-btn">Switch</button>
      </div>

      <div className="suggestions-section">
        <div className="suggestions-header">
          <span className="suggestions-title">Suggested for you</span>
          <button className="see-all-btn">See All</button>
        </div>

        <div className="suggestions-list">
          {suggestedUsers.map((suggestedUser, index) => (
            <div key={index} className="suggestion-item">
              <div className="suggestion-user-info">
                <div className="suggestion-avatar">
                  {getInitials(suggestedUser.name)}
                </div>
                <div className="suggestion-details">
                  <span className="suggestion-username">{suggestedUser.username}</span>
                  <span className="suggestion-subtitle">Suggested for you</span>
                </div>
              </div>
              <button className="follow-btn">Follow</button>
            </div>
          ))}
        </div>
      </div>

      <footer className="sidebar-footer">
        <div className="footer-links">
          <a href="#about">About</a>
          <span>·</span>
          <a href="#help">Help</a>
          <span>·</span>
          <a href="#press">Press</a>
          <span>·</span>
          <a href="#api">API</a>
          <span>·</span>
          <a href="#jobs">Jobs</a>
          <span>·</span>
          <a href="#privacy">Privacy</a>
          <span>·</span>
          <a href="#terms">Terms</a>
        </div>
        <div className="footer-copyright">
          © 2025 SNAPSHOT
        </div>
      </footer>
    </div>
  );
}

export default RightSidebar;

