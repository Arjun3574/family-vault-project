'use client';

import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

interface FamilyMemberProps {
    userId: string;
}

type MemberProfile = {
    displayName: string;
    email: string;
}

export function FamilyMember({ userId }: FamilyMemberProps) {
    const firestore = useFirestore();

    const memberRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'userProfiles', userId);
    }, [firestore, userId]);

    const { data: member, isLoading } = useDoc<MemberProfile>(memberRef);

    if (isLoading) {
        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>
        )
    }

    if (!member) {
        return null;
    }

    return (
        <div className="flex items-center justify-between">
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
    )
}
