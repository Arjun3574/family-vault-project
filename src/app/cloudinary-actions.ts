'use server';

import { v2 as cloudinary } from 'cloudinary';
import { initializeFirebaseServer } from '@/firebase/server-init';
// Use the server-side 'firebase-admin/firestore' package
import { getFirestore } from 'firebase-admin/firestore';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(formData: FormData) {
  // Initialize on every request to ensure a valid instance.
  const { firestore } = initializeFirebaseServer();
  const serverTimestamp = getFirestore.FieldValue.serverTimestamp;

  try {
    const file = formData.get('photo') as File;
    const note = formData.get('note') as string;
    const tags = formData.get('tags') as string;
    const familyId = formData.get('familyId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !familyId || !userId) {
      return { error: 'Missing required data for upload.' };
    }

    // 1. Upload image to Cloudinary
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

    // 2. Save metadata to Firestore using the Admin SDK
    const photoRef = firestore.collection(`families/${familyId}/photos`).doc();
    const photoData = {
      storageUrl: public_id, // Store the public_id from Cloudinary
      userId: userId,
      familyId: familyId,
      textNote: note || '',
      tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
      uploadDate: serverTimestamp(),
    };

    await photoRef.set(photoData);

    return { id: photoRef.id, public_id };
  } catch (error: any) {
    console.error('Error uploading to Cloudinary and saving to Firestore:', error);
    // Return a serializable error object
    return { error: error.message || 'An unknown error occurred during upload.' };
  }
}
