'use client';
import { FamilyClient } from "@/components/family/family-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/auth-provider";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type UserProfile = {
  familyId?: string;
  displayName: string;
  email: string;
};

export default function FamilyPage() {
  const { user } = useAuthContext();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'userProfiles', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isUserLoading } = useDoc<UserProfile>(userProfileRef);

  const familyId = userProfile?.familyId;
  
  const familyRef = useMemoFirebase(() => {
    if (!firestore || !familyId) return null;
    return doc(firestore, 'families', familyId);
  }, [firestore, familyId]);

  const { data: familyData, isLoading: isFamilyLoading } = useDoc(familyRef);
  
  const isLoading = isUserLoading || (userProfile && !familyId) || (familyId && isFamilyLoading);
  
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Family Management</h1>
          <p className="text-lg text-muted-foreground">Manage your family group and invite members.</p>
        </div>
      </div>
       {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
             <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <FamilyClient 
          initialHasFamily={!!familyId} 
          initialFamilyData={familyData} 
          userProfile={userProfile}
        />
      )}
    </div>
  );
}
