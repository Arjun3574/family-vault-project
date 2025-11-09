'use client';
import { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirebase } from '@/firebase';

async function uploadToGoogleDrive(token: string, fileObject: File) {
  const metadata = {
    name: fileObject.name,
    parents: ['appDataFolder'],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', fileObject);

  try {
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error.message}`);
    }

    const file = await response.json();
    return file;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export default function UploadPage() {
  const { auth } = useFirebase();
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  const handleGoogleSignIn = () => {
    if (!auth) {
        toast({ title: 'Firebase not initialized', variant: 'destructive'});
        return;
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.appdata');

    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        if (token) {
          setAccessToken(token);
          setCurrentUser(result.user);
          toast({
            title: 'Sign In Successful',
            description: 'You are now ready to upload photos to your Google Drive.',
          });
        } else {
          throw new Error("Could not retrieve Google access token.");
        }
      })
      .catch((error) => {
        console.error('Error during sign in:', error);
        toast({
          title: 'Sign-In Failed',
          description: error.message,
          variant: 'destructive',
        });
      });
  };

  const handleUploadClick = async () => {
    if (!accessToken) {
      toast({
        title: 'Authentication Error',
        description: 'Google Drive access token not found. Please sign in with Google first.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please choose a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadToGoogleDrive(accessToken, selectedFile);
      toast({
        title: 'Upload Complete!',
        description: `${selectedFile.name} has been saved to your Google Drive.`,
      });
      setSelectedFile(null); // Clear file input
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Please see the console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Upload to Google Drive</CardTitle>
          <CardDescription>
            Save photos directly to a private folder in your Google Drive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {!currentUser || !accessToken ? (
            <div className='space-y-4'>
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Step 1: Authenticate with Google</AlertTitle>
                    <AlertDescription>
                       You need to sign in with your Google account to grant permission to upload files.
                    </AlertDescription>
                </Alert>
                <Button onClick={handleGoogleSignIn} className="w-full">
                    Sign in with Google to Continue
                </Button>
            </div>
          ) : (
             <Alert variant="default" className='bg-secondary'>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Signed in as {currentUser.email}</AlertTitle>
                <AlertDescription>
                    You are authenticated. You can now upload a photo.
                </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <CardTitle className='text-xl'>Step 2: Upload a Photo</CardTitle>
            <div className="space-y-2">
                <label htmlFor="photo-upload-input" className="text-sm font-medium">Choose a photo</label>
                <Input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    disabled={!accessToken || isUploading}
                />
            </div>
            <Button onClick={handleUploadClick} disabled={!accessToken || !selectedFile || isUploading} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload to Drive'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
