import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || "AIzaSyBbMOjlAMW2Rhzf-MTp-wiBDlmuqNGv5tc",
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || "cinex-stream-app.firebaseapp.com",
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "cinex-stream-app",
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || "cinex-stream-app.firebasestorage.app",
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "629111607264",
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || "1:629111607264:web:ea8081f126e3d36509e585"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Guarantee browser-wide persistent login (keeps users logged in across sessions & reloads)
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase persistence warning:', err);
  });
} catch (e) {
  console.warn(e);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup
};
export default app;

