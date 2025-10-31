import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './Feed.css';

function Feed() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query photos from Firestore, ordered by timestamp (newest first)
    const q = query(
      collection(db, 'posts'),
      orderBy('timestamp', 'desc')
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPhotos(photosData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching photos:', error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate();
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="feed-container">
        <div className="loading">Loading photos...</div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="feed-container">
        <div className="empty-feed">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <h3>No photos yet</h3>
          <p>Be the first to upload a photo!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-card">
            <div className="photo-header">
              <div className="photo-user">
                <div className="user-avatar">
                  {photo.username ? photo.username[0].toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                  <span className="username">{photo.username || 'Anonymous'}</span>
                  <span className="timestamp">{formatTimestamp(photo.timestamp)}</span>
                </div>
              </div>
            </div>
            <div className="photo-image-container">
              <img 
                src={photo.imageUrl} 
                alt={photo.caption || 'Photo'} 
                className="photo-image"
              />
            </div>
            {photo.caption && (
              <div className="photo-caption">
                <span className="caption-username">{photo.username || 'Anonymous'}</span>
                {' '}
                {photo.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;

