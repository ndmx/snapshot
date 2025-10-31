import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import './Profile.css';

function Profile({ onClose, username }) {
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsCount, setPostsCount] = useState(0);
  const isOwnProfile = !username || username === auth.currentUser?.email?.split('@')[0];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (isOwnProfile) {
          // Load current user's info from Firestore users collection
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserInfo({
              username: userData.username || auth.currentUser.email.split('@')[0],
              displayName: userData.displayName || auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
              uid: auth.currentUser.uid,
              bio: userData.bio || '',
              followers: userData.followers || [],
              following: userData.following || []
            });
          } else {
            // Fallback if profile doesn't exist yet
            setUserInfo({
              username: auth.currentUser.email.split('@')[0],
              displayName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
              uid: auth.currentUser.uid,
              bio: '',
              followers: [],
              following: []
            });
          }
        } else {
          // Load other user's info from users collection
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('username', '==', username.toLowerCase()));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            setUserInfo({
              username: userData.username,
              displayName: userData.displayName,
              uid: snapshot.docs[0].id,
              bio: userData.bio || '',
              followers: userData.followers || [],
              following: userData.following || []
            });
          } else {
            // User not found
            setUserInfo(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Set loading to false even on error so it doesn't hang
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, isOwnProfile]);

  useEffect(() => {
    if (!userInfo?.username) return;

    // Load user's posts
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('username', '==', userInfo.username),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const userPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(userPosts);
        setPostsCount(userPosts.length);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading posts:', error);
        // Still set loading to false and show empty posts
        setPosts([]);
        setPostsCount(0);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userInfo]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (loading || !userInfo) {
    return (
      <div className="profile-overlay" onClick={onClose}>
        <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
          <div className="profile-loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <button onClick={onClose} className="profile-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h2>{userInfo.username}</h2>
        </div>

        <div className="profile-info-section">
          <div className="profile-avatar-large">
            {getInitials(userInfo.displayName)}
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{postsCount}</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userInfo.followers?.length || 0}</span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userInfo.following?.length || 0}</span>
              <span className="stat-label">following</span>
            </div>
          </div>
          <div className="profile-display-name">
            <strong>{userInfo.displayName}</strong>
          </div>
          {!isOwnProfile && (
            <div className="profile-actions">
              <button className="follow-profile-btn">Follow</button>
              <button className="message-profile-btn">Message</button>
            </div>
          )}
        </div>

        <div className="profile-posts-section">
          <div className="posts-grid">
            {posts.length === 0 ? (
              <div className="no-posts">
                <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <h3>No Posts Yet</h3>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-grid-item">
                  <img src={post.imageUrl} alt={post.caption || 'Post'} />
                  <div className="post-overlay">
                    <span><span role="img" aria-label="heart">❤️</span> 0</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

