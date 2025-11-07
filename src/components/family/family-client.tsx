'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Copy, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, writeBatch, getDoc, arrayUnion, setDoc } from 'firebase/firestore';

type Member = {
    id: string;
    displayName: string;
    email: string;
};

type FamilyData = {
    id: string;
    familyName: string;
    memberIds: string[];
} | null;

interface FamilyClientProps {
    initialHasFamily: boolean;
    initialFamilyData: FamilyData;
    userProfile: any;
}

export function FamilyClient({ initialHasFamily, initialFamilyData, userProfile }: FamilyClientProps) {
  const [hasFamily, setHasFamily] = useState(initialHasFamily);
  const [familyData, setFamilyData] = useState<FamilyData>(initialFamilyData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const firestore = useFirestore();

  const membersQuery = useMemoFirebase(() => {
    if (!firestore || !familyData?.memberIds || familyData.memberIds.length === 0) return null;
    // Firestore 'in' queries are limited to 30 items. For a larger family, you might need a different approach.
    return query(collection(firestore, 'userProfiles'), where('id', 'in', familyData.memberIds.slice(0, 30)));
  }, [firestore, familyData]);

  const { data: members, isLoading: membersLoading } = useCollection<Member>(membersQuery);

  const handleCreateFamily = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !firestore) return;

    setIsLoading(true);
    const familyName = (event.currentTarget.elements.namedItem('familyName') as HTMLInputElement).value;
    
    try {
        const familyDocRef = doc(collection(firestore, 'families'));
        const familyId = familyDocRef.id;

        const newFamilyData = {
            id: familyId,
            familyName: familyName,
            memberIds: [user.uid]
        };

        const userProfileRef = doc(firestore, 'userProfiles', user.uid);
        
        const batch = writeBatch(firestore);
        
        batch.set(familyDocRef, newFamilyData);
        // Use update to add the familyId to the existing user profile.
        batch.update(userProfileRef, { familyId: familyId });

        await batch.commit();
        
        setFamilyData(newFamilyData);
        setHasFamily(true);
        toast({ title: 'Family Created!', description: `Welcome to ${familyName}!` });
    } catch(e: any) {
        console.error("Error creating family: ", e);
        toast({ title: 'Error', description: e.message || 'Could not create family.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleJoinFamily = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !firestore) return;

    setIsLoading(true);
    const familyId = (event.currentTarget.elements.namedItem('familyId') as HTMLInputElement).value;
    
    try {
        const familyDocRef = doc(firestore, 'families', familyId);
        const userProfileRef = doc(firestore, 'userProfiles', user.uid);

        const familySnap = await getDoc(familyDocRef);
        if (!familySnap.exists()) {
          throw new Error("Invalid Family ID. Please check and try again.");
        }
        const familyResult = { ...familySnap.data(), id: familySnap.id } as FamilyData;

        const batch = writeBatch(firestore);

        batch.update(familyDocRef, { memberIds: arrayUnion(user.uid) });

        batch.update(userProfileRef, { familyId: familyId });
        
        await batch.commit();
        
        setFamilyData(familyResult);
        setHasFamily(true);
        toast({ title: 'Welcome to the Family!'});
    } catch (e: any) {
        console.error("Error joining family: ", e);
        toast({ title: 'Error', description: e.message || 'Could not join family.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (familyData?.id) {
        navigator.clipboard.writeText(familyData.id);
        toast({ title: 'Copied!', description: 'Family ID copied to clipboard.' });
    }
  }

  if (hasFamily && familyData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{familyData.familyName}</CardTitle>
                <CardDescription>Your family's private space.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Your Unique Family ID</h3>
                    <p className="text-sm text-muted-foreground">Share this ID with family members to let them join.</p>
                    <div className="mt-2 flex items-center gap-2">
                        <Input readOnly value={familyData.id} className="font-mono" />
                        <Button variant="outline" size="icon" onClick={copyToClipboard}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Members</h3>
                    <div className="mt-2 space-y-4">
                        {membersLoading && <div>Loading members...</div>}
                        {members && members.map(member => (
                            <div key={member.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${member.email}`} />
                                        <AvatarFallback>{member.displayName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{member.displayName}</p>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Family</CardTitle>
          <CardDescription>Start a new private space for your family.</CardDescription>
        </CardHeader>
        <form onSubmit={handleCreateFamily}>
            <CardContent>
                <Label htmlFor="familyName">Family Name</Label>
                <Input id="familyName" name="familyName" placeholder="e.g., The Smiths" required />
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Family
                </Button>
            </CardFooter>
        </form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Join an Existing Family</CardTitle>
          <CardDescription>Enter a Family ID to join a group.</CardDescription>
        </CardHeader>
        <form onSubmit={handleJoinFamily}>
            <CardContent>
                <Label htmlFor="familyId">Family ID</Label>
                <Input id="familyId" name="familyId" placeholder="Enter a valid Family ID" required />
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Join Family
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
