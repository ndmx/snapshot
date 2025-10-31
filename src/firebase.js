import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD1Lfg7H3rzJiSwO2gmJkk5jFQ_4Atohc8",
  authDomain: "snapshot-47d42.firebaseapp.com",
  databaseURL: "https://snapshot-47d42.firebaseio.com",
  projectId: "snapshot-47d42",
  storageBucket: "snapshot-47d42.appspot.com",
  messagingSenderId: "747823783923",
  appId: "1:747823783923:web:30b0e2d82c824b57dffc86",
  measurementId: "G-5D44EW4L4F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;

