'use server';

import { v2 as cloudinary } from 'cloudinary';
import { addPhoto } from '@/ai/flows/add-photo-flow';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(formData: FormData) {
  try {
    const file = formData.get('photo') as File;
    const note = formData.get('note') as string;
    const tags = formData.get('tags') as string;
    const familyId = formData.get('familyId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !familyId || !userId) {
      return { error: 'Missing required data for upload.' };
    }

    // 1. Upload to Cloudinary
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

    // 2. Save metadata to Firestore via Genkit flow
    const photoData = {
      storageUrl: public_id,
      userId: userId,
      familyId: familyId,
      textNote: note || '',
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    };
    
    const firestoreResult = await addPhoto(photoData);

    return { id: firestoreResult.id, public_id };
    
  } catch (error: any) {
    console.error('Error in uploadToCloudinary server action:', error);
    return { error: error.message || 'An unknown error occurred during upload.' };
  }
}
