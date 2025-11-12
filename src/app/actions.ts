'use server';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, doc, collection, writeBatch, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { FirestorePermissionError } from '@/firebase/errors';

// Helper function to initialize Firebase and return Firestore instance for server-side operations.
function getDb(): Firestore {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  return getFirestore(getApp());
}


export async function createFamilyAtomic(uid: string, familyName: string) {
  if (!uid || !familyName) {
    throw new Error("User ID and family name are required.");
  }
  const firestore = getDb();
  const familyRef = doc(collection(firestore, "families"));
  const userRef = doc(firestore, "userProfiles", uid);

  const batch = writeBatch(firestore);

  const familyData = { 
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

    const firestore = getDb();
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

  const firestore = getDb();
  
  const familyRef = doc(firestore, "families", familyId);
  const batch = writeBatch(firestore);
  
  batch.delete(familyRef);
  
  await batch.commit();
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

  const firestore = getDb();
  const photosCollection = collection(firestore, `families/${familyId}/photos`);
  const photoRef = doc(photosCollection);
  
  const photoData = {
    storageUrl: storageId,
    userId: userId,
    familyId: familyId,
    textNote: note || '',
    tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    uploadDate: serverTimestamp(),
  };

  try {
    await setDoc(photoRef, photoData);
    return { success: true, id: photoRef.id };
  } catch (error: any) {
    // Re-throw a more detailed error for the client to catch and display.
    // This allows us to see the security rule context in the Next.js overlay.
    throw new FirestorePermissionError({
        path: photoRef.path,
        operation: 'create',
        requestResourceData: photoData,
    });
  }
}
