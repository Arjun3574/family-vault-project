

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { Button } from '../ui/button';
import { Loader2, MoreVertical, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { deletePhoto } from '@/app/actions';
import { useAuthContext } from '@/contexts/auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


export type Photo = {
  id: string;
  src: string; // This will now be treated as a Cloudinary Public ID
  alt: string;
  description: string;
  tags: string[];
  date: string;
  familyId: string;
};

interface PhotoCardProps {
  photo: Photo;
  index: number;
}

const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3'];

// Initialize Cloudinary with a hardcoded cloud name to prevent env var issues.
const cld = new Cloudinary({
  cloud: {
    cloudName: 'dgodngj10',
  },
});

export function PhotoCard({ photo, index }: PhotoCardProps) {
  const rotation = rotations[index % rotations.length];
  const { familyId } = useAuthContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Use the src as the publicID for Cloudinary
  const cldImg = cld
    .image(photo.src)
    .format('auto')
    .quality('auto')
    .resize(fill().width(500).height(500).gravity(autoGravity()));
    
  const cldImgLarge = cld
    .image(photo.src)
    .format('auto')
    .quality('auto')
    .resize(fill().width(1024).height(1024).gravity(autoGravity()));

  const handleDelete = async () => {
    if (!familyId) {
      toast({ title: "Error", description: "Family not found.", variant: "destructive" });
      return;
    }
    setIsDeleting(true);
    try {
      await deletePhoto(familyId, photo.id);
      toast({ title: "Photo Deleted", description: "The memory has been removed." });
      // The component will be removed from the UI by the parent's real-time listener
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not delete photo.", variant: "destructive" });
      setIsDeleting(false);
    }
  }

  return (
    <Dialog>
      <div className={cn("break-inside-avoid animate-in fade-in-50 duration-500 relative group", rotation)}>
        <Card className="overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
          <DialogTrigger asChild>
            <CardContent className="relative p-0 aspect-square bg-muted cursor-pointer">
              <AdvancedImage cldImg={cldImg} className="object-cover w-full h-full" alt={photo.alt} />
            </CardContent>
          </DialogTrigger>
          <div className="p-4">
            <CardDescription className="mb-2">{photo.description}</CardDescription>
            <div className="flex flex-wrap gap-2">
              {photo.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="capitalize">{tag}</Badge>
              ))}
            </div>
          </div>
          <CardFooter className="flex justify-between items-center p-4 pt-0">
              <p className="text-xs text-muted-foreground">
                Added {formatDistanceToNow(new Date(photo.date), { addSuffix: true })}
              </p>
              
              <AlertDialog>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                              </DropdownMenuItem>
                          </AlertDialogTrigger>
                      </DropdownMenuContent>
                  </DropdownMenu>

                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this photo?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action is permanent and cannot be undone. This will permanently delete this memory from your family's collection.
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Delete
                      </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </CardFooter>
        </Card>
      </div>
       <DialogContent className="max-w-3xl p-0">
        <DialogHeader className='sr-only'>
          <DialogTitle>{photo.description || 'Enlarged family photo'}</DialogTitle>
        </DialogHeader>
        <div className="aspect-square bg-muted">
          <AdvancedImage cldImg={cldImgLarge} className="object-contain w-full h-full" alt={photo.alt} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
