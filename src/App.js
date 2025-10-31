import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import CreateModal from './components/CreateModal';
import Search from './components/Search';
import Explore from './components/Explore';
import Messages from './components/Messages';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Feed from './components/Feed';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const closeAllPanels = () => {
    setShowSearch(false);
    setShowExplore(false);
    setShowMessages(false);
    setShowNotifications(false);
    setShowProfile(false);
  };

  const handleSearchClick = () => {
    closeAllPanels();
    setShowSearch(true);
  };

  const handleExploreClick = () => {
    closeAllPanels();
    setShowExplore(true);
  };

  const handleMessagesClick = () => {
    closeAllPanels();
    setShowMessages(true);
  };

  const handleNotificationsClick = () => {
    closeAllPanels();
    setShowNotifications(true);
  };

  const handleProfileClick = () => {
    closeAllPanels();
    setShowProfile(true);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="App">
      <Sidebar 
        onCreateClick={() => setShowCreateModal(true)} 
        onSearchClick={handleSearchClick}
        onExploreClick={handleExploreClick}
        onMessagesClick={handleMessagesClick}
        onNotificationsClick={handleNotificationsClick}
        onProfileClick={handleProfileClick}
        user={user} 
      />
      
      <main className="app-main">
        <Feed />
      </main>

      <RightSidebar user={user} />

      {showCreateModal && (
        <CreateModal onClose={() => setShowCreateModal(false)} />
      )}

      {showSearch && (
        <Search onClose={() => setShowSearch(false)} currentUserId={user.uid} />
      )}

      {showExplore && (
        <Explore onClose={() => setShowExplore(false)} />
      )}

      {showMessages && (
        <Messages onClose={() => setShowMessages(false)} />
      )}

      {showNotifications && (
        <Notifications onClose={() => setShowNotifications(false)} />
      )}

      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}

export default App;
