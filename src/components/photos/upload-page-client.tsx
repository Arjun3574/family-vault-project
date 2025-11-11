'use client';

import { useAuthContext } from "@/contexts/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UploadForm } from "./upload-form";

export function UploadPageClient() {
  const { user, familyId, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!familyId || !user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Family Found</AlertTitle>
        <AlertDescription>
          You must create or join a family before you can upload photos.
          <Link href="/family">
            <Button variant="link" className="p-0 h-auto ml-1">
              Go to the Family page
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return <UploadForm user={user} familyId={familyId} />;
}
