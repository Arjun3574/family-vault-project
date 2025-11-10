'use server';

import { FieldValue } from "firebase-admin/firestore";
import { initializeFirebaseServer } from "@/firebase/server-init";

const { firestore } = initializeFirebaseServer();

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
