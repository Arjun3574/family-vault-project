'use client';
import { UploadForm } from '@/components/photos/upload-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';

export default function UploadPage() {
    return (
        <div className="container mx-auto max-w-2xl">
            <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <UploadCloud className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="font-headline text-4xl font-bold tracking-tight">Upload a Memory</h1>
                    <p className="text-lg text-muted-foreground">Add a new photo to your family's collection.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>New Photo Details</CardTitle>
                    <CardDescription>
                        Choose a photo and add a story or tags to help you remember the moment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UploadForm />
                </CardContent>
            </Card>
        </div>
    );
}
