'use client';
import {
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  collection,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const { auth, firestore } = initializeFirebase();

/**
 * Uploads a file to the user's Google Drive AppData folder.
 * @param token The Google Drive API access token.
 * @param fileObject The file to upload.
 * @returns The file metadata from Google Drive, including the file ID.
 */
async function uploadToGoogleDrive(token: string, fileObject: File) {
  const metadata = {
    name: fileObject.name,
    parents: ['appDataFolder'],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', fileObject);

  console.log("Uploading to Google Drive...");

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: form
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Google Drive API Error:", errorData);
    throw new Error(`Google Drive upload failed: ${errorData.error.message}`);
  }

  const file = await response.json();
  console.log("File uploaded successfully to Google Drive! File ID:", file.id);
  return file;
}


export async function uploadFamilyPhotoClient(
  accessToken: string,
  file: File,
  note: string,
  tags: string,
  familyId: string
) {
  if (!auth.currentUser) throw new Error('Not authenticated');
  if (!accessToken) throw new Error('Google Drive access token not found.');
  
  const uid = auth.currentUser.uid;

  // 1. Upload to Google Drive
  const driveFile = await uploadToGoogleDrive(accessToken, file);

  // 2. Save metadata to Firestore, storing the Google Drive fileId
  const photoRef = doc(collection(firestore, `families/${familyId}/photos`));
  const photoData = {
    // Instead of storageUrl, we save the gDriveFileId
    gDriveFileId: driveFile.id, 
    userId: uid,
    familyId: familyId,
    textNote: note || '',
    tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    uploadDate: serverTimestamp(),
  };

  await setDoc(photoRef, photoData);

  // Return the Google Drive file ID and the new Firestore document ID
  return { id: photoRef.id, gDriveFileId: driveFile.id };
}
