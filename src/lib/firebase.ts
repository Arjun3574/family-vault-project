// This file is obsolete and can be removed.
// All firebase initialization is now handled by the provider system.
// Keeping it for now to avoid breaking imports, but it should be deprecated.
import { initializeFirebase } from '@/firebase';

const { firebaseApp, auth, firestore, storage } = initializeFirebase();

export { firebaseApp as app, auth, firestore as db, storage };
