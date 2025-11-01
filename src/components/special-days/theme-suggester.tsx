'use client';
import { useState } from 'react';
import { suggestThemeTemplates } from '@/ai/flows/suggest-theme-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, PartyPopper } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent } from '../ui/card';

export function ThemeSuggester() {
  const [eventType, setEventType] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getSuggestions = async () => {
    if (!eventType) {
      toast({ title: 'Event type is required', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await suggestThemeTemplates({ eventType });
      setSuggestions(result.themeTemplates);
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to get suggestions', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="eventType" className="text-right">Event Type</Label>
        <Input
          id="eventType"
          name="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="col-span-2"
          placeholder="e.g. Birthday, Anniversary"
        />
        <Button type="button" onClick={getSuggestions} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Suggest Theme
        </Button>
      </div>

        {(isLoading || suggestions.length > 0) && (
             <div className="col-span-4 space-y-2">
                <Label>Theme Suggestions</Label>
                {isLoading && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating creative ideas...
                    </div>
                )}
                {suggestions.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <RadioGroup name="theme" className="grid grid-cols-2 gap-4">
                                {suggestions.map((suggestion, index) => (
                                <Label
                                    key={index}
                                    htmlFor={`theme-${index}`}
                                    className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                >
                                    <RadioGroupItem value={suggestion} id={`theme-${index}`} />
                                    <PartyPopper className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium capitalize">{suggestion}</span>
                                </Label>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                )}
             </div>
        )}
    </div>
  );
}
