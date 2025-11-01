import { FamilyClient } from "@/components/family/family-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function FamilyPage() {
  // In a real app, you would fetch family data for the user here
  const userHasFamily = true; // Mock data
  const familyData = userHasFamily ? {
    id: "FAM-AbCd1234",
    name: "The Doe Family",
    members: [
      { id: "1", name: "Alex Doe", role: "Admin", avatar: "https://i.pravatar.cc/150?u=alexdoe" },
      { id: "2", name: "Jane Doe", role: "Member", avatar: "https://i.pravatar.cc/150?u=janedoe" },
    ],
  } : null;

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
      <FamilyClient initialHasFamily={userHasFamily} initialFamilyData={familyData} />
    </div>
  );
}
