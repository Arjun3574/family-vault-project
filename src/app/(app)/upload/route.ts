
import { NextResponse } from 'next/server';
import { initializeFirebaseServer } from '@/firebase/server-init';
import { FieldValue } from 'firebase-admin/firestore';

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

    // 1. Upload to Cloudinary using fetch
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'family-vault-unsigned'); // Use an unsigned upload preset
    cloudinaryFormData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    const uploadResult = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok || uploadResult.error) {
       throw new Error(uploadResult.error?.message || 'Cloudinary upload failed.');
    }

    // 2. Save metadata to Firestore
    const photoData = {
      storageUrl: uploadResult.public_id, // Storing public_id, not the full URL
      userId: userId,
      familyId: familyId,
      textNote: note || '',
      tagIds: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
      uploadDate: FieldValue.serverTimestamp(),
    };

    const photoRef = firestore.collection(`families/${familyId}/photos`).doc();
    await photoRef.set(photoData);

    return NextResponse.json({ success: true, id: photoRef.id });

  } catch (error: any) {
    console.error('Error in upload route:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred during upload.' }, { status: 500 });
  }
}
