'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Copy, Loader2, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { createFamilyAtomic, joinFamilyAtomic, deleteFamilyAtomic } from '@/app/actions';
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

type Member = {
    id: string;
    displayName: string;
    email: string;
};

type FamilyData = {
    id: string;
    familyName: string;
    memberIds: string[];
    owner: string;
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
    return query(collection(firestore, 'userProfiles'), where(documentId(), 'in', familyData.memberIds.slice(0, 30)));
  }, [firestore, familyData]);

  const { data: members, isLoading: membersLoading } = useCollection<Member>(membersQuery);

  const handleCreateFamily = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setIsLoading(true);
    const familyName = (event.currentTarget.elements.namedItem('familyName') as HTMLInputElement).value;
    
    try {
        const familyId = await createFamilyAtomic(user.uid, familyName);
        
        setFamilyData({
            id: familyId,
            familyName: familyName,
            memberIds: [user.uid],
            owner: user.uid
        });
        setHasFamily(true);
        toast({ title: 'Family Created!', description: `Welcome to ${familyName}!` });
    } catch(e: any) {
        console.error("Error creating family: ", e);
        toast({ title: 'Error Creating Family', description: e.message || 'Could not create family.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleJoinFamily = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setIsLoading(true);
    const familyId = (event.currentTarget.elements.namedItem('familyId') as HTMLInputElement).value;
    
    try {
        await joinFamilyAtomic(user.uid, familyId);
        setHasFamily(true);
        toast({ title: 'Welcome to the Family!'});
    } catch (e: any) {
        console.error("Error joining family: ", e);
        toast({ title: 'Error Joining Family', description: e.message || 'Could not join family.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteFamily = async () => {
    if (!user || !familyData) return;
    
    setIsLoading(true);
    try {
      await deleteFamilyAtomic(user.uid, familyData.id);
      setFamilyData(null);
      setHasFamily(false);
      toast({ title: 'Family Deleted', description: 'The family has been successfully deleted.' });
    } catch (e: any) {
      console.error("Error deleting family: ", e);
      toast({ title: 'Error Deleting Family', description: e.message || 'Could not delete family.', variant: 'destructive' });
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

  const isOwner = user && familyData?.owner === user.uid;

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
                                        <AvatarFallback>{member.displayName?.charAt(0) || 'U'}</AvatarFallback>
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
            {isOwner && (
            <CardFooter className="border-t border-destructive/20 bg-destructive/5 p-4">
                <div className="flex w-full flex-col items-start gap-2">
                    <h3 className="font-semibold text-destructive">Danger Zone</h3>
                    <p className="text-sm text-destructive/80">
                        Deleting the family is permanent and cannot be undone. This will remove all members and delete all associated data.
                    </p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete Family
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action is permanent and cannot be undone. This will permanently delete the <strong>{familyData.familyName}</strong> family and remove all members.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteFamily}>
                                Yes, delete family
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
          </CardFooter>
        )}
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
                <Button type="submit" disabled={isLoading || !user}>
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
                <Button type="submit" disabled={isLoading || !user}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Join Family
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
