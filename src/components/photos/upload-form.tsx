'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mic, FileAudio, Image as ImageIcon, Loader2 } from "lucide-react"
import { useState, useMemo } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, serverTimestamp, addDoc, doc } from "firebase/firestore";
import { useAuthContext } from "@/contexts/auth-provider";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


const formSchema = z.object({
  photo: z.any().refine(file => file?.length == 1, "Photo is required."),
  note: z.string().max(500, "Note must be 500 characters or less.").optional(),
  tags: z.string().min(1, "Add at least one tag."),
});

type UserProfile = {
  familyId?: string;
};

export function UploadForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { user } = useAuthContext();
  const firestore = useFirestore();
  const storage = getStorage();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'userProfiles', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
      tags: "",
    },
  });
  
  const photoRef = form.register("photo");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const familyId = userProfile?.familyId;

    if (!user || !firestore || !familyId) {
        toast({ title: "Authentication or Family ID error", description: "You must be logged in and part of a family to upload photos.", variant: "destructive" });
        return;
    }

    const photoFile = values.photo[0];
    if (!photoFile) {
        toast({ title: "No photo selected", description: "Please select a photo to upload.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `photos/${user.uid}/${Date.now()}_${photoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, photoFile);
    
    toast({
      title: "Uploading Memory...",
      description: "Your photo is being added to the vault.",
    });
    form.reset();
    setFileName("");
    
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Upload failed", error);
        toast({
            title: "Upload Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        setUploadProgress(null);
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const photoData = {
              userId: user.uid,
              familyId: familyId,
              storageUrl: downloadURL,
              textNote: values.note,
              tagIds: values.tags.split(',').map(tag => tag.trim().toLowerCase()),
              uploadDate: serverTimestamp(),
          };

          const photosCollection = collection(firestore, `families/${familyId}/photos`);
          addDoc(photosCollection, photoData)
            .then(() => {
                toast({
                    title: "Memory Uploaded! 🎉",
                    description: "Your photo has been successfully added to the vault.",
                });
            })
            .catch(error => {
                console.error("Failed to save photo metadata", error);
                 errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                      path: photosCollection.path,
                      operation: 'create',
                      requestResourceData: photoData,
                    })
                  )
            })
            .finally(() => {
                setIsSubmitting(false);
                setUploadProgress(null);
            });
      
        }).catch((error) => {
           console.error("Could not get download URL", error);
           toast({
                title: "Upload Failed",
                description: "Could not finalize photo upload.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            setUploadProgress(null);
        });
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    {...photoRef}
                    onChange={(e) => {
                      field.onChange(e.target.files);
                      setFileName(e.target.files?.[0]?.name ?? "");
                    }}
                    disabled={isSubmitting}
                  />
                  <div className="flex h-32 w-full flex-col items-center justify-center rounded-md border-2 border-dashed">
                    {fileName ? (
                      <>
                        <ImageIcon className="mb-2 h-8 w-8 text-primary" />
                        <span className="text-sm font-medium">{fileName}</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
                      </>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {uploadProgress !== null && (
            <div className="space-y-2">
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
            </div>
        )}

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add a note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell the story behind this photo..."
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
            <FormLabel>Voice Note (Optional)</FormLabel>
            <div className="flex items-center gap-4">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                    <Mic className="mr-2 h-4 w-4"/>
                    Record Voice Note
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileAudio className="h-4 w-4" />
                    <span>No voice note recorded.</span>
                </div>
            </div>
            <FormDescription>
                Share the story in your own voice.
            </FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Birthday, Trip, Summer 2024" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormDescription>
                Separate tags with commas. This helps in organizing your memories.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || !userProfile?.familyId} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
           "Add to Vault"
          )}
        </Button>
      </form>
    </Form>
  )
}
