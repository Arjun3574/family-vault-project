'use server';

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { FirestorePermissionError } from '@/firebase/errors';

// Initialize Firebase Admin SDK
// In a managed environment like App Hosting, the SDK automatically finds credentials.
if (!getApps().length) {
  initializeApp();
}

const firestore = getFirestore();

export async function createFamilyAtomic(uid: string, familyName: string) {
  if (!uid || !familyName) {
    throw new Error("User ID and family name are required.");
  }
  
  const familyRef = firestore.collection("families").doc();
  const userRef = firestore.collection("userProfiles").doc(uid);

  const batch = firestore.batch();

  const familyData = { 
    familyName, 
    owner: uid, 
    memberIds: [uid],
    createdAt: FieldValue.serverTimestamp() 
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

    const familyRef = firestore.collection("families").doc(familyId);
    const userRef = firestore.collection("userProfiles").doc(uid);
    
    const batch = firestore.batch();

    const familyUpdate = { memberIds: FieldValue.arrayUnion(uid) };
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
  
  const familyRef = firestore.collection("families").doc(familyId);
  const batch = firestore.batch();
  
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
  
  const photosCollection = firestore.collection(`families/${familyId}/photos`);
  const photoRef = photosCollection.doc();
  
  const photoData = {
    storageUrl: storageId,
    userId: userId,
    familyId: familyId,
    textNote: note || '',
    tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    uploadDate: FieldValue.serverTimestamp(),
  };

  try {
    await photoRef.set(photoData);
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
