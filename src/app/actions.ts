'use server';

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc, arrayUnion, writeBatch, collection, serverTimestamp, setDoc } from "firebase/firestore";
import { initializeFirebaseServer } from "@/firebase/server-init";

const { firestore, storage } = initializeFirebaseServer();

export async function createFamilyAtomic(uid: string, familyName: string) {
  if (!uid || !familyName) {
    throw new Error("User ID and family name are required.");
  }
  const familyRef = doc(collection(firestore, "families"));
  const userRef = doc(firestore, "userProfiles", uid);

  const batch = writeBatch(firestore);

  batch.set(familyRef, { 
    familyName, 
    owner: uid, 
    memberIds: [uid],
    createdAt: serverTimestamp() 
  });
  batch.update(userRef, { familyId: familyRef.id });

  await batch.commit();
  return familyRef.id;
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

    batch.update(familyRef, {
        memberIds: arrayUnion(uid)
    });
    batch.update(userRef, { familyId });

    await batch.commit();

    return familyId;
}


export async function uploadFamilyPhoto(uid: string, familyId: string, formData: FormData) {
  const file = formData.get('photo') as File;
  const textNote = formData.get('note') as string;
  const tags = formData.get('tags') as string;

  if (!file) throw new Error("No file provided.");

  // Defensive checks
  const userSnap = await getDoc(doc(firestore, "userProfiles", uid));
  if (!userSnap.exists()) throw new Error("User profile missing");
  const user = userSnap.data();
  if (!user.familyId || user.familyId !== familyId) throw new Error("User not in this family");

  const path = `families/${familyId}/photos/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  // Save metadata to Firestore subcollection
  const photoRef = doc(collection(firestore, `families/${familyId}/photos`));
  await setDoc(photoRef, {
    storageUrl: url,
    userId: uid,
    familyId: familyId,
    textNote: textNote || "",
    tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    uploadDate: serverTimestamp(),
  });

  return { id: photoRef.id, url };
}
