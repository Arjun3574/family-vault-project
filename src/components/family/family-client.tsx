'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Copy, Loader2 } from 'lucide-react';

type Member = {
    id: string;
    name: string;
    role: string;
    avatar: string;
};

type FamilyData = {
    id: string;
    name: string;
    members: Member[];
} | null;

interface FamilyClientProps {
    initialHasFamily: boolean;
    initialFamilyData: FamilyData;
}

export function FamilyClient({ initialHasFamily, initialFamilyData }: FamilyClientProps) {
  const [hasFamily, setHasFamily] = useState(initialHasFamily);
  const [familyData, setFamilyData] = useState<FamilyData>(initialFamilyData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateFamily = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const familyName = (event.currentTarget.elements.namedItem('familyName') as HTMLInputElement).value;
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newFamilyData: FamilyData = {
        id: `FAM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        name: familyName,
        members: [{ id: "1", name: "You", role: "Admin", avatar: "https://i.pravatar.cc/150?u=alexdoe" }],
    };
    
    setFamilyData(newFamilyData);
    setHasFamily(true);
    setIsLoading(false);
    toast({ title: 'Family Created!', description: `Welcome to ${familyName}!` });
  };
  
  const handleJoinFamily = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const familyId = (event.currentTarget.elements.namedItem('familyId') as HTMLInputElement).value;
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (familyId.toUpperCase() === 'FAM-DEMO123') {
        const joinedFamily: FamilyData = {
             id: familyId.toUpperCase(),
             name: "The Demo Family",
             members: [
                { id: "1", name: "John Demo", role: "Admin", avatar: "https://i.pravatar.cc/150?u=johndemo" },
                { id: "2", name: "You", role: "Member", avatar: "https://i.pravatar.cc/150?u=alexdoe" },
            ],
        };
        setFamilyData(joinedFamily);
        setHasFamily(true);
        toast({ title: 'Welcome to the Family!', description: `You've joined ${joinedFamily.name}!` });
    } else {
        toast({ title: 'Error', description: 'Invalid Family ID.', variant: 'destructive' });
    }
    setIsLoading(false);
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
                <CardTitle className="font-headline text-2xl">{familyData.name}</CardTitle>
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
                        {familyData.members.map(member => (
                            <div key={member.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">{member.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button variant="default">Invite Members</Button>
            </CardFooter>
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
                <Input id="familyId" name="familyId" placeholder="FAM-..." required />
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
