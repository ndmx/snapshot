import React from 'react';
import './Logo.css';

function Logo({ size = 'medium', showText = true }) {
  const sizes = {
    small: 24,
    medium: 32,
    large: 48
  };

  const iconSize = sizes[size] || sizes.medium;

  return (
    <div className={`logo-container ${size}`}>
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="logo-icon"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#667eea', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#764ba2', stopOpacity:1}} />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="12" fill="url(#logoGrad)"/>
        <path d="M42 20H38L36 16H28L26 20H22C19.79 20 18 21.79 18 24V42C18 44.21 19.79 46 22 46H42C44.21 46 46 44.21 46 42V24C46 21.79 44.21 20 42 20Z" fill="white"/>
        <circle cx="32" cy="33" r="7" fill="url(#logoGrad)"/>
        <circle cx="40" cy="25" r="1.5" fill="white"/>
      </svg>
      {showText && <span className="logo-text">Snapshot</span>}
    </div>
  );
}

export default Logo;

