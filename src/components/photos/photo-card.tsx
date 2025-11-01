import Image from 'next/image';
import { Card, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export type Photo = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  description: string;
  tags: string[];
  date: string;
};

interface PhotoCardProps {
  photo: Photo;
  index: number;
}

const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3'];

export function PhotoCard({ photo, index }: PhotoCardProps) {
  const rotation = rotations[index % rotations.length];
  
  // Ensure width and height are numbers, providing a default if they are not.
  const imageWidth = typeof photo.width === 'number' && !isNaN(photo.width) ? photo.width : 500;
  const imageHeight = typeof photo.height === 'number' && !isNaN(photo.height) ? photo.height : 500;

  return (
    <div className={cn("break-inside-avoid animate-in fade-in-50 duration-500", rotation)}>
      <Card className="overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
        <CardContent className="p-0">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={imageWidth}
            height={imageHeight}
            className="object-cover"
            data-ai-hint={photo.tags.join(' ')}
          />
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
