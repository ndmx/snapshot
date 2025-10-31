import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import './Notifications.css';

function Notifications({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setLoading(false);

      // Mark as read
      notifs.filter(n => !n.read).forEach(async (n) => {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      });
    });

    return () => unsubscribe();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name[0].toUpperCase();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h2>Notifications</h2>
        </div>

        <div className="notifications-list">
          {loading && <div className="notifications-loading">Loading...</div>}

          {!loading && notifications.length === 0 && (
            <div className="no-notifications">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <h3>No notifications yet</h3>
              <p>When someone likes or comments on your posts, you'll see them here</p>
            </div>
          )}

          {notifications.map((notification) => (
            <div key={notification.id} className="notification-item">
              <div className="notif-avatar">
                {getInitials(notification.fromUsername)}
              </div>
              <div className="notif-content">
                <div className="notif-text">
                  <span className="notif-username">{notification.fromUsername}</span>
                  {' '}
                  {notification.type === 'like' && 'liked your post.'}
                  {notification.type === 'comment' && `commented: "${notification.text}"`}
                  {notification.type === 'follow' && 'started following you.'}
                </div>
                <span className="notif-time">{formatTime(notification.timestamp)}</span>
              </div>
              {notification.postImage && (
                <img src={notification.postImage} alt="" className="notif-post-thumb" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Notifications;

