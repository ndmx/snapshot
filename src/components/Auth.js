import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import Logo from './Logo';
import './Auth.css';

function Auth() {
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set auth persistence to local (stays logged in)
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Check if username already exists in users collection
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', usernameInput.toLowerCase()));
        const usernameSnapshot = await getDocs(q);
        
        if (!usernameSnapshot.empty) {
          setError('Username already taken');
          setLoading(false);
          return;
        }

        // Create email from username (for internal use only)
        const email = `${usernameInput.toLowerCase()}@snapshot.app`;
        
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: displayName || usernameInput
        });

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username: usernameInput.toLowerCase(),
          displayName: displayName || usernameInput,
          email: email,
          bio: '',
          photoURL: '',
          followers: [],
          following: [],
          createdAt: new Date()
        });
      } else {
        // Login - find user by username
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', usernameInput.toLowerCase()));
        const usernameSnapshot = await getDocs(q);
        
        if (usernameSnapshot.empty) {
          setError('Username not found');
          setLoading(false);
          return;
        }

        const userData = usernameSnapshot.docs[0].data();
        
        // Sign in with the stored email
        await signInWithEmailAndPassword(auth, userData.email, password);
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo-wrapper">
          <Logo size="large" showText={true} />
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            required
            className="auth-input"
            autoComplete="username"
          />
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="auth-input"
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="auth-input"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
          {!isSignUp && (
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          )}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>
        <div className="auth-toggle">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <span onClick={() => setIsSignUp(false)} className="auth-link">
                Log In
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <span onClick={() => setIsSignUp(true)} className="auth-link">
                Sign Up
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;

