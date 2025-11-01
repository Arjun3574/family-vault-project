'use client';
import { useState, useMemo } from 'react';
import { PhotoCard, type Photo } from './photo-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photos.forEach(photo => photo.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (!selectedTag) return photos;
    return photos.filter(photo => photo.tags.includes(selectedTag));
  }, [photos, selectedTag]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button
            variant={!selectedTag ? 'secondary' : 'outline'}
            onClick={() => setSelectedTag(null)}
            size="sm"
            className="rounded-full"
        >
            All
        </Button>
        {allTags.map(tag => (
          <Button
            key={tag}
            variant={selectedTag === tag ? 'secondary' : 'outline'}
            onClick={() => setSelectedTag(tag)}
            className="rounded-full capitalize"
            size="sm"
          >
            {tag}
          </Button>
        ))}
      </div>
      {filteredPhotos.length > 0 ? (
         <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4">
            {filteredPhotos.map((photo, index) => (
                <PhotoCard key={photo.id} photo={photo} index={index} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-24 text-center">
            <h3 className="font-headline text-2xl font-semibold tracking-tight">No Photos Found</h3>
            <p className="text-muted-foreground">Try a different tag or upload some new memories!</p>
        </div>
      )}
    </div>
  );
}
