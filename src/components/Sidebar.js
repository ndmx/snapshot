import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Logo from './Logo';
import './Sidebar.css';

function Sidebar({ 
  onCreateClick, 
  onSearchClick, 
  onExploreClick,
  onMessagesClick, 
  onNotificationsClick, 
  onProfileClick,
  user 
}) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Logo size="medium" showText={true} />
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item active">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z"/>
          </svg>
          <span>Home</span>
        </button>

        <button className="nav-item" onClick={onSearchClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span>Search</span>
        </button>

        <button className="nav-item" onClick={onExploreClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
          </svg>
          <span>Explore</span>
        </button>

        <button className="nav-item" onClick={onMessagesClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
          </svg>
          <span>Messages</span>
        </button>

        <button className="nav-item" onClick={onNotificationsClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span>Notifications</span>
        </button>

        <button className="nav-item create-btn" onClick={onCreateClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>Create</span>
        </button>

        <button className="nav-item profile-nav" onClick={onProfileClick}>
          <div className="profile-avatar-small">
            {user?.displayName ? user.displayName[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <span>Profile</span>
        </button>
      </nav>

      <button className="nav-item more-btn" onClick={handleLogout}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="3" y2="12"/>
          <line x1="3" y1="6" x2="3" y2="6"/>
          <line x1="3" y1="18" x2="3" y2="18"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
          <polyline points="14 7 9 12 14 17"/>
        </svg>
        <span>Logout</span>
      </button>
    </div>
  );
}

export default Sidebar;

