'use server';
/**
 * @fileOverview A flow for adding photo metadata to Firestore.
 * This flow is used by the server action that uploads photos to Cloudinary.
 *
 * - addPhoto - A function that saves photo metadata to Firestore.
 * - AddPhotoInput - The input type for the addPhoto function.
 * - AddPhotoOutput - The return type for the addPhoto function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

const AddPhotoInputSchema = z.object({
    storageUrl: z.string(),
    userId: z.string(),
    familyId: z.string(),
    textNote: z.string(),
    tags: z.array(z.string()),
});
export type AddPhotoInput = z.infer<typeof AddPhotoInputSchema>;

const AddPhotoOutputSchema = z.object({
  id: z.string(),
});
export type AddPhotoOutput = z.infer<typeof AddPhotoOutputSchema>;

function getAdminApp(): App {
    if (getApps().length) {
        return getApps()[0]!;
    }
    return initializeApp();
}

export const addPhotoFlow = ai.defineFlow(
  {
    name: 'addPhotoFlow',
    inputSchema: AddPhotoInputSchema,
    outputSchema: AddPhotoOutputSchema,
  },
  async (input) => {
    const app = getAdminApp();
    const firestore = getFirestore(app);
    
    const photoRef = firestore.collection(`families/${input.familyId}/photos`).doc();
    
    const photoData = {
      ...input,
      tagIds: input.tags, // Remap for schema consistency
      uploadDate: new Date(),
    };
    delete (photoData as any).tags;

    await photoRef.set(photoData);

    return { id: photoRef.id };
  }
);


export async function addPhoto(input: AddPhotoInput): Promise<AddPhotoOutput> {
  return addPhotoFlow(input);
}
