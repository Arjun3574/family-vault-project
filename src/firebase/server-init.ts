// DO NOT USE 'use client'
import { firebaseConfig } from '@/firebase/config';
import admin from 'firebase-admin';
import { App, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { Storage, getStorage } from 'firebase-admin/storage';

interface FirebaseServerServices {
  firebaseApp: App;
  auth: Auth;
  firestore: Firestore;
  storage: Storage;
}

// This function is for SERVER-SIDE use only.
export function initializeFirebaseServer(): FirebaseServerServices {
    // Corrected initialization: Do not pass the entire client-side config to the admin SDK.
    // It will automatically use Application Default Credentials in the App Hosting environment.
    // Only the storageBucket is needed for Storage operations if not automatically detected.
    if (!getApps().length) {
        initializeApp({
            credential: admin.credential.applicationDefault(),
            storageBucket: firebaseConfig.storageBucket,
        });
    }
    
    const app = getApp();
    
    return {
        firebaseApp: app,
        auth: getAuth(app),
        firestore: getFirestore(app),
        storage: getStorage(app),
    };
}
