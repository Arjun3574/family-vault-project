'use client';
import {
  doc,
  serverTimestamp,
  setDoc,
  collection,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

const { firestore, storage } = initializeFirebase();
const auth = initializeFirebase().auth;

// This function is now deprecated in favor of the Cloudinary server action
// but kept for reference or potential future use.
export async function uploadFamilyPhotoClient(
  file: File,
  note: string,
  tags: string,
  familyId: string,
  onProgress: (progress: number) => void
) {
  if (!auth.currentUser) throw new Error('Not authenticated');

  const uid = auth.currentUser.uid;
  
  onProgress(10); // Initial progress

  // 1. Upload to Firebase Storage
  const storageRef = ref(storage, `families/${familyId}/photos/${uid}/${Date.now()}_${file.name}`);
  
  onProgress(30);
  await uploadBytes(storageRef, file);
  onProgress(70);

  const downloadURL = await getDownloadURL(storageRef);
  onProgress(90);

  // 2. Save metadata to Firestore
  const photoRef = doc(collection(firestore, `families/${familyId}/photos`));
  const photoData = {
    storageUrl: downloadURL, 
    userId: uid,
    familyId: familyId,
    textNote: note || '',
    tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    uploadDate: serverTimestamp(),
  };

  await setDoc(photoRef, photoData);
  onProgress(100);

  return { id: photoRef.id, url: downloadURL };
}
