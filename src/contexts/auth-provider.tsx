'use client';

import {
  User,
  signOut,
} from 'firebase/auth';
import { createContext, useMemo, useContext } from 'react';
import { useUser, useAuth } from '@/firebase';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  const handleLogout = () => {
    if (!auth) return;
    signOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      loading: isUserLoading,
      logout: handleLogout,
    }),
    [user, isUserLoading, auth]
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
