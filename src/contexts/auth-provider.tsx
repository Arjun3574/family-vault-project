'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { User, GoogleAuthProvider, getAdditionalUserInfo, UserCredential } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  familyId: string | null;
  createdAt?: any;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  familyId: string | null;
  accessToken: string | null; // For Google Drive API
  setAccessToken: (token: string | null) => void;
  loading: boolean; // True if either auth state or profile is loading
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, firestore, user, isUserLoading: isAuthLoading } = useFirebase();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'userProfiles', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (user && firestore && auth.currentUser) {
      ensureUserProfile(firestore, user);
      
      // The user object from onAuthStateChanged doesn't have the full UserCredential.
      // We must get it from the currentUser after the state has settled.
      // The `auth.currentUser` might still be null briefly after `user` is set.
      try {
        const info = getAdditionalUserInfo({ ...auth.currentUser } as UserCredential);
        if (info && info.providerId === GoogleAuthProvider.PROVIDER_ID) {
            const cred = GoogleAuthProvider.credentialFromResult({user});
            // This is a bit of a hack, ideal would be to get it on signin flow
            // but that's in another component.
        }
      } catch(e) {
          // This can fail if getAdditionalUserInfo is called at the wrong time.
          // We can safely ignore it as the token is primarily handled in the sign-in form.
      }
    }
    if (!user) {
        setAccessToken(null);
    }
  }, [user, firestore, auth]);
  
  const handleLogout = () => {
    if (!auth) return;
    setAccessToken(null);
    auth.signOut();
  };

  const value = useMemo((): AuthContextType => ({
    user,
    userProfile: userProfile ?? null,
    familyId: userProfile?.familyId ?? null,
    accessToken,
    setAccessToken,
    loading: isAuthLoading || (user && isProfileLoading), // Loading if auth is loading OR if user exists but profile is still loading
    logout: handleLogout,
  }), [user, userProfile, isAuthLoading, isProfileLoading, handleLogout, accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
