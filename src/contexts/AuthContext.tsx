import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithPopup,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../lib/firebase';
import { initializeUserDocument, createInitialCollections } from '../services/database';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, name: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await initializeUserDocument({
        uid: result.user.uid,
        email: result.user.email,
        displayName: name,
        photoURL: result.user.photoURL
      } as User);
      await createInitialCollections();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async function login(email: string, password: string, remember: boolean) {
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await initializeUserDocument({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      } as User);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await initializeUserDocument({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      } as User);
      return result.user;
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email address but different sign-in credentials.');
      }
      throw error;
    }
  }

  async function loginWithFacebook() {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await initializeUserDocument({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      } as User);
      return result.user;
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email address but different sign-in credentials.');
      }
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      // toast.success('Logged out successfully'); // Remove toast here
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          await initializeUserDocument({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          } as User);
        } catch (error) {
          console.error('Error initializing user document:', error);
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    loginWithFacebook,
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
