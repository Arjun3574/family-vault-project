'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// This server action is now deprecated in favor of the /upload API route,
// but is kept for reference. The API route handles multipart/form-data
// and allows for a larger body size limit, which is necessary for file uploads.
export async function uploadToCloudinary(formData: FormData) {
  try {
    const file = formData.get('photo') as File;
    if (!file) {
      return { error: 'Missing file for upload.' };
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
    
    return { public_id: uploadResult.public_id };
    
  } catch (error: any) {
    console.error('Error in uploadToCloudinary server action:', error);
    return { error: error.message || 'An unknown error occurred during upload.' };
  }
}
