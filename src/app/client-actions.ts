'use client';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  getFirestore,
  serverTimestamp,
  setDoc,
  collection,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const { auth, firestore, storage } = initializeFirebase();

export async function uploadFamilyPhotoClient(
  file: File,
  note: string,
  tags: string,
  familyId: string
) {
  if (!auth.currentUser) throw new Error('Not authenticated');
  const uid = auth.currentUser.uid;

  const userSnap = await getDoc(doc(firestore, 'userProfiles', uid));
  if (!userSnap.exists()) throw new Error('User profile missing');
  const user = userSnap.data();
  if (!user.familyId || user.familyId !== familyId) {
    throw new Error('User not in this family');
  }

  const path = `families/${familyId}/photos/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  // Save metadata to Firestore subcollection
  const photoRef = doc(collection(firestore, `families/${familyId}/photos`));
  const photoData = {
    storageUrl: url,
    userId: uid,
    familyId: familyId,
    textNote: note || '',
    tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    uploadDate: serverTimestamp(),
  };

  await setDoc(photoRef, photoData);

  return { id: photoRef.id, url };
}
