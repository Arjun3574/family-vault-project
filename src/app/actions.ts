'use server';

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc, arrayUnion, writeBatch, collection, serverTimestamp, setDoc } from "firebase/firestore";
import { initializeFirebaseServer } from "@/firebase/server-init";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter-server";

const { firestore, storage } = initializeFirebaseServer();

export async function createFamilyAtomic(uid: string, familyName: string, userDisplayName: string, userEmail: string) {
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
    // This is a critical step. If the batch fails due to permissions,
    // we need to know which part failed and with what data.
    // We can't know for sure if it was the set or the update, so we report 'write'.
    const permissionError = new FirestorePermissionError({
      path: `families/${familyRef.id} and userProfiles/${uid}`,
      operation: 'write', // A batch can contain multiple operations
      requestResourceData: {
        family: familyData,
        userProfileUpdate: userProfileUpdate
      },
    });
    // This will throw the error to be caught by the client.
    // In a real app, a server-side emitter might log to a different system.
    // For this prototype, re-throwing is sufficient to get the error to the dev overlay.
    throw permissionError;
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
        // Create the contextual error object on failure.
        const permissionError = new FirestorePermissionError({
            path: `families/${familyId} and userProfiles/${uid}`,
            operation: 'update',
            requestResourceData: { 
                familyUpdate,
                userProfileUpdate
             },
        });
        // Throw the error so the Next.js dev overlay can display it.
        throw permissionError;
    }
}


export async function uploadFamilyPhoto(uid: string, familyId: string, formData: FormData) {
  const file = formData.get('photo') as File;
  const textNote = formData.get('note') as string;
  const tags = formData.get('tags') as string;

  if (!file) throw new Error("No file provided.");

  // Defensive checks remain important
  const userSnap = await getDoc(doc(firestore, "userProfiles", uid));
  if (!userSnap.exists()) throw new Error("User profile missing");
  const user = userSnap.data();
  if (!user.familyId || user.familyId !== familyId) throw new Error("User not in this family");

  const path = `families/${familyId}/photos/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, path);
  
  // Storage uploads should also be wrapped for permission errors, but that's a separate step.
  // We focus on the Firestore error reported.
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  // Save metadata to Firestore subcollection
  const photoRef = doc(collection(firestore, `families/${familyId}/photos`));
  const photoData = {
    storageUrl: url,
    userId: uid,
    familyId: familyId,
    textNote: textNote || "",
    tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    uploadDate: serverTimestamp(),
  };

  try {
    await setDoc(photoRef, photoData);
  } catch (error) {
    // This is where the permission error likely occurred.
    // We create and throw the specialized error.
    const permissionError = new FirestorePermissionError({
      path: photoRef.path,
      operation: 'create',
      requestResourceData: photoData,
    });
    // Re-throw the error so it's caught by Next.js's error boundary
    // and displayed in the development overlay.
    throw permissionError;
  }


  return { id: photoRef.id, url };
}
