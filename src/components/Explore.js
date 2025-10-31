import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import './Explore.css';

function Explore({ onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExplorePosts = async () => {
      try {
        // Get all posts from Firestore
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('timestamp', 'desc'), limit(50));
        
        const snapshot = await getDocs(q);
        const allPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPosts(allPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error loading explore posts:', error);
        setLoading(false);
      }
    };

    loadExplorePosts();
  }, []);

  return (
    <div className="explore-overlay" onClick={onClose}>
      <div className="explore-panel" onClick={(e) => e.stopPropagation()}>
        <div className="explore-header">
          <button onClick={onClose} className="explore-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h2>Explore</h2>
        </div>

        <div className="explore-content">
          {loading ? (
            <div className="explore-loading">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="no-explore-posts">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <h3>No posts to explore yet</h3>
              <p>Start sharing photos to see them here</p>
            </div>
          ) : (
            <div className="explore-grid">
              {posts.map((post) => (
                <div key={post.id} className="explore-item">
                  <img src={post.imageUrl} alt={post.caption || 'Post'} />
                  <div className="explore-overlay-hover">
                    <div className="explore-stats">
                      <span className="explore-stat">
                        <span role="img" aria-label="heart">❤️</span> 0
                      </span>
                      <span className="explore-stat">
                        <span role="img" aria-label="comment">💬</span> 0
                      </span>
                    </div>
                    <div className="explore-username">
                      @{post.username}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Explore;


