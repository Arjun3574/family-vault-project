import { SpecialDaysClient } from "@/components/special-days/special-days-client";
import { CalendarHeart } from "lucide-react";

export default function SpecialDaysPage() {
    // Using static mock data to ensure the page loads without Firebase dependencies.
    const specialDays = [
        { id: "1", name: "Dad's Birthday", date: "October 26", eventType: "Birthday", theme: "balloons" },
        { id: "2", name: "Anniversary", date: "June 15", eventType: "Anniversary", theme: "photo album" },
        { id: "3", name: "Lily's Graduation", date: "May 20", eventType: "Graduation", theme: "confetti" },
    ];
    
    return (
        <div className="container mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <CalendarHeart className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="font-headline text-4xl font-bold tracking-tight">Special Days</h1>
                    <p className="text-lg text-muted-foreground">Automate memories for your family's milestones.</p>
                </div>
            </div>
            
            <SpecialDaysClient initialDays={specialDays} />
        </div>
    );
}
