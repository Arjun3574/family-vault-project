'use server';

import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if not already initialized.
// This is the correct pattern for server-side code in Next.js.
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
    
    const familySnap = await familyRef.get();
    if (!familySnap.exists) {
        throw new Error("Family not found.");
    }

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
  const familySnap = await familyRef.get();

  if (!familySnap.exists) {
    throw new Error("Family not found.");
  }

  const familyData = familySnap.data();
  if (familyData!.owner !== uid) {
    throw new Error("Only the family owner can delete the family.");
  }

  const batch = firestore.batch();

  // Reset familyId for all members
  if (familyData!.memberIds && familyData!.memberIds.length > 0) {
    const membersQuery = firestore.collection('userProfiles').where('familyId', '==', familyId);
    const membersSnap = await membersQuery.get();
    membersSnap.forEach(memberDoc => {
      batch.update(memberDoc.ref, { familyId: null });
    });
  }

  // Delete the family document
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

  const photoData = {
    storageUrl: storageId,
    userId: userId,
    familyId: familyId,
    textNote: note || '',
    tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    uploadDate: FieldValue.serverTimestamp(),
  };

  const photoRef = firestore.collection(`families/${familyId}/photos`).doc();
  await photoRef.set(photoData);

  return { success: true, id: photoRef.id };
}
