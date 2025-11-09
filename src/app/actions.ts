'use server';

import { doc, getDoc, updateDoc, arrayUnion, writeBatch, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { initializeFirebaseServer } from "@/firebase/server-init";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter-server";

const { firestore } = initializeFirebaseServer();

export async function createFamilyAtomic(uid: string, familyName: string) {
  if (!uid || !familyName) {
    throw new Error("User ID and family name are required.");
  }
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

  try {
    await batch.commit();
    return familyRef.id;
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: `families/${familyRef.id} and userProfiles/${uid}`,
      operation: 'write',
      requestResourceData: {
        family: familyData,
        userProfileUpdate: userProfileUpdate
      },
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the original error if emitter doesn't throw
    throw error;
  }
}


export async function joinFamilyAtomic(uid: string, familyId: string) {
    if (!uid || !familyId) {
        throw new Error("User ID and Family ID are required.");
    }

    const familyRef = doc(firestore, "families", familyId);
    const userRef = doc(firestore, "userProfiles", uid);
    
    const familySnap = await getDoc(familyRef);
    if (!familySnap.exists()) {
        throw new Error("Family not found.");
    }

    const batch = writeBatch(firestore);

    const familyUpdate = { memberIds: arrayUnion(uid) };
    batch.update(familyRef, familyUpdate);

    const userProfileUpdate = { familyId };
    batch.update(userRef, userProfileUpdate);

    try {
        await batch.commit();
        return familyId;
    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: `families/${familyId} and userProfiles/${uid}`,
            operation: 'update',
            requestResourceData: { 
                familyUpdate,
                userProfileUpdate
             },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }
}

export async function deleteFamilyAtomic(uid: string, familyId: string) {
  if (!uid || !familyId) {
    throw new Error("User ID and Family ID are required.");
  }

  const familyRef = doc(firestore, "families", familyId);
  const familySnap = await getDoc(familyRef);

  if (!familySnap.exists()) {
    throw new Error("Family not found.");
  }

  const familyData = familySnap.data();
  if (familyData.owner !== uid) {
    throw new Error("Only the family owner can delete the family.");
  }

  const batch = writeBatch(firestore);

  // Reset familyId for all members
  if (familyData.memberIds && familyData.memberIds.length > 0) {
    const membersQuery = query(collection(firestore, 'userProfiles'), where('familyId', '==', familyId));
    const membersSnap = await getDocs(membersQuery);
    membersSnap.forEach(memberDoc => {
      batch.update(memberDoc.ref, { familyId: null });
    });
  }

  // Delete the family document
  batch.delete(familyRef);

  try {
    await batch.commit();
    return { success: true };
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: `families/${familyId}`,
      operation: 'delete',
      requestResourceData: { familyId },
    });
    errorEmitter.emit('permission-error', permissionError);
    throw error;
  }
}
