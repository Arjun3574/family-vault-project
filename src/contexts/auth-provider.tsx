'use client';

import type { User } from 'firebase/auth';
import { createContext, useState, useEffect, useMemo } from 'react';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User for demonstration purposes
const mockUser = {
  uid: 'mock-user-123',
  email: 'user@familyvault.com',
  displayName: 'Alex Doe',
  photoURL: 'https://i.pravatar.cc/150?u=alexdoe',
} as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd use firebase.auth().onAuthStateChanged here
    // For now, we check a value in localStorage to simulate session persistence
    try {
      const session = localStorage.getItem('family-vault-session');
      if (session === 'true') {
        setUser(mockUser);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
    setLoading(false);
  }, []);

  const login = () => {
    setLoading(true);
    // Simulate async login
    setTimeout(() => {
      localStorage.setItem('family-vault-session', 'true');
      setUser(mockUser);
      setLoading(false);
    }, 500);
  };

  const logout = () => {
    setLoading(true);
    // Simulate async logout
    setTimeout(() => {
      localStorage.removeItem('family-vault-session');
      setUser(null);
      setLoading(false);
    }, 500);
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
