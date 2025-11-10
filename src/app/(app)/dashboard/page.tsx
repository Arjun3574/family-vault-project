'use client';
import { PhotoGrid } from '@/components/photos/photo-grid';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Photo } from '@/components/photos/photo-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/contexts/auth-provider';
import { useCollection } from '@/firebase/firestore/use-collection';

type FirestorePhoto = {
  id: string;
  gDriveFileId: string; // Changed from storageUrl
  textNote: string;
  tagIds: string[];
  uploadDate: Timestamp;
};

export default function DashboardPage() {
  const { familyId, loading: isUserLoading } = useAuthContext();
  const firestore = useFirestore();

  const photosQuery = useMemoFirebase(() => {
    if (!firestore || !familyId) return null;
    return query(
      collection(firestore, `families/${familyId}/photos`),
      orderBy('uploadDate', 'desc')
    );
  }, [firestore, familyId]);

  const { data: photosData, isLoading: isPhotosLoading } = useCollection<FirestorePhoto>(photosQuery);

  const photos: Photo[] = photosData ? photosData.map(p => ({
    id: p.id,
    gDriveFileId: p.gDriveFileId, // Pass the fileId to the photo object
    alt: p.textNote || 'A family memory',
    description: p.textNote || '',
    tags: p.tagIds || [],
    date: p.uploadDate?.toDate().toISOString() || new Date().toISOString(),
  })) : [];
  
  const isLoading = isUserLoading || (familyId && isPhotosLoading);

  if (isLoading) {
    return (
        <div className="container mx-auto">
            <div className="mb-8 space-y-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
            </div>
            <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                ))}
            </div>
        </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Your Photo Wall</h1>
        <p className="text-lg text-muted-foreground">A canvas of your family's cherished moments.</p>
      </div>
      
      {photos && photos.length > 0 ? (
        <PhotoGrid photos={photos} />
      ) : (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-24 text-center">
            <h3 className="font-headline text-2xl font-semibold tracking-tight">Your Wall is Empty</h3>
            <p className="text-muted-foreground">Upload your first photo to start your collection!</p>
        </div>
      )}
    </div>
  );
}
