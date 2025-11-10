'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface GDriveImageProps {
  fileId: string;
  alt: string;
  className?: string;
}

// Cache to store fetched image URLs
const imageCache = new Map<string, string>();

async function getGDriveFile(token: string, fileId: string): Promise<string> {
  if (imageCache.has(fileId)) {
    return imageCache.get(fileId)!;
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to fetch image: ${errorData.error.message}`);
  }

  const blob = await response.blob();
  const objectURL = URL.createObjectURL(blob);
  
  // Store in cache
  imageCache.set(fileId, objectURL);

  return objectURL;
}

export function GDriveImage({ fileId, alt, className }: GDriveImageProps) {
  const { accessToken } = useAuthContext();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      if (!accessToken || !fileId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const src = await getGDriveFile(accessToken, fileId);
        if (isMounted) {
          setImageSrc(src);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(`Failed to load image for fileId ${fileId}:`, err);
          setError(err.message || 'Failed to load image.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      // Optional: Revoke object URL on unmount if it's not cached globally
      // if (imageSrc && imageSrc.startsWith('blob:')) {
      //   URL.revokeObjectURL(imageSrc);
      // }
    };
  }, [fileId, accessToken]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-destructive/10 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="mt-2 text-center text-xs">Could not load image</p>
      </div>
    );
  }

  if (imageSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageSrc} alt={alt} className={className || "object-cover h-full w-full"} />;
  }

  return null; // Or a placeholder if no token/fileId
}
