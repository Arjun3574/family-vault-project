import { Card, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

export type Photo = {
  id: string;
  src: string; // This will now be treated as a Cloudinary Public ID
  alt: string;
  description: string;
  tags: string[];
  date: string;
};

interface PhotoCardProps {
  photo: Photo;
  index: number;
}

const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3'];

// Initialize Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
});

export function PhotoCard({ photo, index }: PhotoCardProps) {
  const rotation = rotations[index % rotations.length];

  // Use the src as the publicID for Cloudinary
  const cldImg = cld
    .image(photo.src)
    .format('auto')
    .quality('auto')
    .resize(fill().width(500).height(500).gravity(autoGravity()));

  return (
    <div className={cn("break-inside-avoid animate-in fade-in-50 duration-500", rotation)}>
      <Card className="overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
        <CardContent className="relative p-0 aspect-square bg-muted">
          <AdvancedImage cldImg={cldImg} className="object-cover w-full h-full" alt={photo.alt} />
        </CardContent>
        <div className="p-4">
           <CardDescription className="mb-2">{photo.description}</CardDescription>
           <div className="flex flex-wrap gap-2">
            {photo.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="capitalize">{tag}</Badge>
            ))}
          </div>
        </div>
        <CardFooter className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Added {formatDistanceToNow(new Date(photo.date), { addSuffix: true })}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
