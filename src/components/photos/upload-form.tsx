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
import { Mic, FileAudio, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react"
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-provider";
import { Skeleton } from "../ui/skeleton";
import { uploadFamilyPhotoClient } from "@/app/client-actions";


const formSchema = z.object({
  photo: z.any().refine(file => file?.length == 1, "Photo is required."),
  note: z.string().max(500, "Note must be 500 characters or less.").optional(),
  tags: z.string().min(1, "Add at least one tag."),
});


export function UploadForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user, familyId, loading } = useAuthContext();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
      tags: "",
    },
  });
  
  const photoRef = form.register("photo");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !familyId) {
        toast({ title: "Verification Error", description: "You must be logged in and part of a family to upload photos.", variant: "destructive" });
        return;
    }
    
    const photoFile = values.photo[0];
    if (!photoFile) {
        toast({ title: "No photo selected", description: "Please select a photo to upload.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    // Fake progress for UI feedback
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
        toast({
          title: "Uploading Photo...",
          description: "Your memory is being added to the vault.",
        });

        await uploadFamilyPhotoClient(photoFile, values.note || '', values.tags, familyId);
        
        clearInterval(progressInterval);
        setUploadProgress(100);

        toast({
            title: "Memory Uploaded! 🎉",
            description: "Your photo has been successfully saved.",
        });
        form.reset();
        setFileName("");
        router.push('/dashboard');
    } catch(error: any) {
        clearInterval(progressInterval);
        console.error("Upload failed", error);
        toast({
            title: "Upload Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
    }
  }

  if (loading) {
      return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      )
  }
  
  if (!familyId) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Family Found</AlertTitle>
            <AlertDescription>
                You must create or join a family before you can upload photos.
                <Link href="/family">
                    <Button variant="link" className="p-0 h-auto ml-1">Go to the Family page</Button>
                </Link>
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={isSubmitting}>
            <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Photo</FormLabel>
                <FormControl>
                    <div className="relative">
                    <Input 
                        id="photo-upload-input"
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
            
            {isSubmitting && (
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

            <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
                </>
            ) : (
            "Add to Vault"
            )}
            </Button>
        </fieldset>
      </form>
    </Form>
  )
}
