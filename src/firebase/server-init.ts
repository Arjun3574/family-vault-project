// DO NOT USE 'use client'
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';
import admin from 'firebase-admin';

interface FirebaseServerServices {
  firebaseApp: App;
  auth: Auth;
  firestore: Firestore;
  storage: Storage;
}

// This function is for SERVER-SIDE use only.
export function initializeFirebaseServer(): FirebaseServerServices {
    const app = !getApps().length ? initializeApp({
        credential: admin.credential.applicationDefault(),
        ...firebaseConfig
    }) : getApp();
    
    return {
        firebaseApp: app,
        auth: getAuth(app),
        firestore: getFirestore(app),
        storage: getStorage(app),
    };
}
