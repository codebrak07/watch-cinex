import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider,
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup
} from '../firebase';

const AuthContext = createContext(null);

function saveAccountToHistory(user) {
  if (!user || !user.email) return;
  try {
    const history = JSON.parse(localStorage.getItem('cinex_saved_accounts') || '[]');
    const existingIdx = history.findIndex(
      (a) => (a.email && a.email.toLowerCase() === user.email.toLowerCase()) || a.id === user.uid
    );
    const accountObj = {
      id: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      avatar: (user.displayName || user.email).charAt(0).toUpperCase(),
      avatarUrl: user.photoURL || null,
      lastLogin: Date.now()
    };
    if (existingIdx >= 0) {
      history[existingIdx] = { ...history[existingIdx], ...accountObj };
    } else {
      history.unshift(accountObj);
    }
    localStorage.setItem('cinex_saved_accounts', JSON.stringify(history));
  } catch (e) {
    console.warn(e);
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cached = localStorage.getItem('cinex_auth_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          localStorage.setItem('cinex_auth_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null
          }));
          saveAccountToHistory(user);
        } catch (e) {}
      } else {
        localStorage.removeItem('cinex_auth_user');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName = '') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const finalName = displayName || email.split('@')[0];
    if (cred.user) {
      await updateProfile(cred.user, { displayName: finalName });
      setCurrentUser({ ...cred.user, displayName: finalName });
      saveAccountToHistory({ ...cred.user, displayName: finalName });
    }
    return cred;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      saveAccountToHistory(cred.user);
    }
    return cred;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user) {
      const disp = cred.user.displayName || cred.user.email.split('@')[0];
      saveAccountToHistory(cred.user);
      localStorage.setItem('cinex_active_profile', JSON.stringify({
        name: disp,
        avatar: disp.charAt(0).toUpperCase()
      }));
    }
    return cred;
  };

  const logout = () => {
    try {
      localStorage.removeItem('cinex_auth_user');
      localStorage.removeItem('cinex_active_profile');
      localStorage.removeItem('netflix_active_profile');
    } catch (e) {}
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

