'use client';

import {
  User,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { useAuth as useFirebaseAuth } from '@/firebase';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useFirebaseAuth();

  useEffect(() => {
    if (!auth) {
      // Firebase might not be initialized yet
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const login = () => {
    if (!auth) return;
    setLoading(true);
    signInAnonymously(auth).catch((error) => {
      console.error('Anonymous sign-in failed:', error);
      setLoading(false);
    });
  };

  const logout = () => {
    if (!auth) return;
    signOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
