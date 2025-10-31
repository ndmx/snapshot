import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import './Search.css';

function Search({ onClose, currentUserId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        // Search in users collection from Firestore
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('username', '>=', searchTerm.toLowerCase()),
          where('username', '<=', searchTerm.toLowerCase() + '\uf8ff'),
          orderBy('username'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setResults(users);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <h2>Search</h2>
        </div>
        
        <div className="search-input-container">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">
              ×
            </button>
          )}
        </div>

        <div className="search-results">
          {loading && <div className="search-loading">Searching...</div>}
          
          {!loading && searchTerm.length >= 2 && results.length === 0 && (
            <div className="no-results">No users found</div>
          )}

          {!loading && results.map((user) => (
            <div key={user.id} className="search-result-item">
              <div className="result-user-info">
                <div className="result-avatar">
                  {getInitials(user.displayName)}
                </div>
                <div className="result-details">
                  <span className="result-username">{user.username}</span>
                  <span className="result-displayname">{user.displayName}</span>
                </div>
              </div>
              <a href={`#/profile/${user.username}`} className="view-profile-btn">
                View
              </a>
            </div>
          ))}

          {!searchTerm && (
            <div className="search-placeholder">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <p>Search for users</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;

