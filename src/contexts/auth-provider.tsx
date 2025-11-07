'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';

export interface AuthContextType {
  user: User | null;
  loading: boolean; // This now means "is auth state ready?"
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This function ensures a user profile document exists in Firestore.
const ensureUserProfile = async (firestore: Firestore, user: User) => {
  const userRef = doc(firestore, "userProfiles", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    try {
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        familyId: null,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to create user profile:", error);
      // This error should be surfaced to the user in a real app.
    }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  
  useEffect(() => {
    if (user && firestore) {
      // When user object is available, ensure their profile exists in DB.
      ensureUserProfile(firestore, user);
    }
  }, [user, firestore]);

  const handleLogout = () => {
    if (!auth) return;
    auth.signOut();
  };

  const value: AuthContextType = {
    user,
    loading: isUserLoading,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
