import { PhotoGrid } from '@/components/photos/photo-grid';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {

  // In a real application, you would fetch photos from Firestore here.
  // For this demo, we'll use placeholder images.
  const photos = PlaceHolderImages.map(p => {
    const url = new URL(p.imageUrl);
    const width = parseInt(url.searchParams.get('w') || '1080');
    const height = parseInt(url.searchParams.get('h') || '1080');
    
    return {
      id: p.id,
      src: p.imageUrl,
      alt: p.description,
      width: width,
      height: height,
      description: p.description,
      tags: p.imageHint.split(' '),
      date: new Date(Date.now() - Math.random() * 31536000000).toISOString(), // Random date in the last year
    }
  });
  
  return (
    <div className="container mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Your Photo Wall</h1>
        <p className="text-lg text-muted-foreground">A canvas of your family's cherished moments.</p>
      </div>
      
      <PhotoGrid photos={photos} />
    </div>
  );
}
