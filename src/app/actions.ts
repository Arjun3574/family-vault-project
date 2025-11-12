'use server';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  writeBatch, 
  arrayUnion, 
  serverTimestamp, 
  collection, 
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper to initialize and get the Firestore instance, ensuring it's done only once.
function getDb(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

export async function createFamilyAtomic(uid: string, familyName: string) {
  if (!uid || !familyName) {
    throw new Error("User ID and family name are required.");
  }
  
  const app = getDb();
  const firestore = getFirestore(app);
  const familyRef = doc(collection(firestore, "families"));
  const userRef = doc(firestore, "userProfiles", uid);

  const batch = writeBatch(firestore);

  const familyData = { 
    id: familyRef.id,
    familyName, 
    owner: uid, 
    memberIds: [uid],
    createdAt: serverTimestamp() 
  };
  batch.set(familyRef, familyData);
  
  const userProfileUpdate = { familyId: familyRef.id };
  batch.update(userRef, userProfileUpdate);

  await batch.commit();
  return familyRef.id;
}

export async function joinFamilyAtomic(uid: string, familyId: string) {
    if (!uid || !familyId) {
        throw new Error("User ID and Family ID are required.");
    }

    const app = getDb();
    const firestore = getFirestore(app);
    const familyRef = doc(firestore, "families", familyId);
    const userRef = doc(firestore, "userProfiles", uid);
    
    const batch = writeBatch(firestore);

    const familyUpdate = { memberIds: arrayUnion(uid) };
    batch.update(familyRef, familyUpdate);

    const userProfileUpdate = { familyId };
    batch.update(userRef, userProfileUpdate);

    await batch.commit();
    return familyId;
}

export async function deleteFamilyAtomic(uid: string, familyId: string) {
  if (!uid || !familyId) {
    throw new Error("User ID and Family ID are required.");
  }
  
  const app = getDb();
  const firestore = getFirestore(app);
  const familyRef = doc(firestore, "families", familyId);

  // For this prototype, we'll keep the simple delete.
  // In production, you'd want to delete all photos in a subcollection, etc.
  await deleteDoc(familyRef);
  
  return { success: true };
}

export async function savePhotoDetails(data: {
  familyId: string;
  userId: string;
  note: string;
  tags: string;
  storageId: string;
}) {
  const { familyId, userId, note, tags, storageId } = data;

  if (!familyId || !userId || !storageId) {
    throw new Error("Missing required photo details.");
  }
  
  const app = getDb();
  const firestore = getFirestore(app);
  
  const photoData = {
    storageUrl: storageId,
    userId: userId,
    familyId: familyId,
    textNote: note || '',
    tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    uploadDate: serverTimestamp(),
  };

  const photosCollection = collection(firestore, `families/${familyId}/photos`);
  const photoRef = doc(photosCollection);

  try {
    await addDoc(photosCollection, photoData);
    return { success: true, id: photoRef.id };
  } catch (error: any) {
    // Re-throw a more detailed error for the client to catch and display.
    // This allows us to see the security rule context in the Next.js overlay.
    // NOTE: In an admin context, the `auth` object in the error will be null,
    // as admin operations don't have a user auth context. The check in the
    // security rule should ideally check for admin access or user access.
    // For this prototype, we'll see the request and can adjust rules accordingly.
    throw new FirestorePermissionError({
        path: photoRef.path,
        operation: 'create',
        requestResourceData: photoData,
    });
  }
}
