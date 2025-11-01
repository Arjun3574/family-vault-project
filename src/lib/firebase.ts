import { initializeFirebase } from '@/firebase';
import { getStorage } from 'firebase/storage';

const { firebaseApp, auth, firestore } = initializeFirebase();
const storage = getStorage(firebaseApp);

export { firebaseApp as app, auth, firestore as db, storage };
