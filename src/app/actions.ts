'use server';

import { doc, getDoc, updateDoc, arrayUnion, writeBatch, collection, serverTimestamp } from "firebase/firestore";
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
