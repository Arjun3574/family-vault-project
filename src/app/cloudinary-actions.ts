'use server';

import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Direct initialization of Firebase Admin SDK
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    ...firebaseConfig
  });
}


export async function uploadToCloudinary(formData: FormData) {
  try {
    const adminApp = initializeAdminApp();
    const firestore = adminApp.firestore();

    const file = formData.get('photo') as File;
    const note = formData.get('note') as string;
    const tags = formData.get('tags') as string;
    const familyId = formData.get('familyId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !familyId || !userId) {
      return { error: 'Missing required data for upload.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const uploadResult = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream({}, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (result) {
          resolve(result as { public_id: string; secure_url: string });
        } else {
          reject(new Error('Cloudinary upload result is undefined.'));
        }
      }).end(buffer);
    });

    const { public_id } = uploadResult;

    const photoRef = firestore.collection(`families/${familyId}/photos`).doc();
    const photoData = {
      storageUrl: public_id,
      userId: userId,
      familyId: familyId,
      textNote: note || '',
      tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
      uploadDate: FieldValue.serverTimestamp(),
    };

    await photoRef.set(photoData);

    return { id: photoRef.id, public_id };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary and saving to Firestore:', error);
    return { error: error.message || 'An unknown error occurred during upload.' };
  }
}
