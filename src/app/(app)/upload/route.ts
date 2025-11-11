'use server';

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { initializeFirebaseServer } from '@/firebase/server-init';
import { FieldValue } from 'firebase-admin/firestore';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const { firestore } = initializeFirebaseServer();
    const formData = await request.formData();
    
    const file = formData.get('photo') as File;
    const note = formData.get('note') as string;
    const tags = formData.get('tags') as string;
    const userId = formData.get('userId') as string;
    const familyId = formData.get('familyId') as string;

    if (!file || !userId || !familyId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const uploadResult = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'family-vault' }, (error, result) => {
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

    // 2. Save metadata to Firestore
    const photoData = {
      storageUrl: uploadResult.public_id, // Storing public_id, not the full URL
      userId: userId,
      familyId: familyId,
      textNote: note || '',
      tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
      uploadDate: FieldValue.serverTimestamp(), // Correct way to set server timestamp with Admin SDK
    };

    const photoRef = firestore.collection(`families/${familyId}/photos`).doc();
    await photoRef.set(photoData);

    return NextResponse.json({ success: true, id: photoRef.id });

  } catch (error: any) {
    console.error('Error in upload route:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred during upload.' }, { status: 500 });
  }
}
