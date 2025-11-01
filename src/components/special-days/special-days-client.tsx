'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSuggester } from './theme-suggester';
import { Badge } from '../ui/badge';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type SpecialDay = {
    id: string;
    name: string;
    date: string;
    eventType: string;
    theme?: string;
};

interface SpecialDaysClientProps {
    initialDays: SpecialDay[];
}

export function SpecialDaysClient({ initialDays }: SpecialDaysClientProps) {
  const [days, setDays] = useState<SpecialDay[]>(initialDays);
  const [open, setOpen] = useState(false);
  
  const handleAddDay = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newDay: SpecialDay = {
          id: `${Math.random()}`,
          name: formData.get('name') as string,
          date: formData.get('date') as string,
          eventType: formData.get('eventType') as string,
          theme: formData.get('theme') as string,
      };
      setDays(prev => [...prev, newDay]);
      setOpen(false);
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {days.map(day => (
            <Card key={day.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline">{day.name}</CardTitle>
                    <CardDescription>{day.date}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Event Type: <Badge variant="outline">{day.eventType}</Badge></div>
                        <div className="text-sm font-medium">Theme: {day.theme ? <Badge variant="secondary" className="capitalize">{day.theme}</Badge> : 'Not set'}</div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" size="sm">Edit</Button>
                </CardFooter>
            </Card>
        ))}

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Card className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-transparent p-6 transition-all hover:border-primary hover:bg-secondary">
                    <PlusCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                    <h3 className="font-headline text-lg font-semibold">Add Special Day</h3>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Add a New Special Day</DialogTitle>
                    <DialogDescription>
                        Set up a new milestone to celebrate with automated memories.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDay} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" className="col-span-3" placeholder="e.g. Mom's 60th Birthday" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Date</Label>
                        <Input id="date" name="date" className="col-span-3" placeholder="e.g. March 15" />
                    </div>
                    <ThemeSuggester />
                    <div className="flex justify-end pt-4">
                         <Button type="submit">Add Day</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>

    </div>
  );
}
