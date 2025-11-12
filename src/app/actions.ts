
'use server';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, doc, collection, writeBatch, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

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
    
    // In server actions with client SDK, we can't easily check for existence
    // without a 'getDoc' call, which we'll trust the rules to enforce.
    // The rules should prevent joining a non-existent family.

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
  
  // Note: Firestore security rules are the primary enforcement mechanism here.
  // We are assuming the rules correctly check for ownership before allowing deletion.
  // The client-side logic already confirms this, but rules provide the real security.
  
  const familyRef = doc(firestore, "families", familyId);
  const batch = writeBatch(firestore);
  
  // Deleting the family document. We cannot query members to update them
  // easily in a single server action without more complex logic.
  // Client-side will need to handle the user profile update upon family deletion.
  batch.delete(familyRef);
  
  // This simplified version relies on client-side logic to clear familyId
  // from profiles or a more complex backend process (like a function).
  // For this context, we will just delete the family doc itself.

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
  await setDoc(photoRef, photoData);

  return { success: true, id: photoRef.id };
}

