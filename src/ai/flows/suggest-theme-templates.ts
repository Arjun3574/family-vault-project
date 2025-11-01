'use server';

/**
 * @fileOverview A flow that uses generative AI to suggest theme templates (overlays, banners, animation styles) for special days.
 *
 * - suggestThemeTemplates - A function that suggests theme templates for a given event type.
 * - SuggestThemeTemplatesInput - The input type for the suggestThemeTemplates function.
 * - SuggestThemeTemplatesOutput - The return type for the suggestThemeTemplates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestThemeTemplatesInputSchema = z.object({
  eventType: z
    .string()
    .describe(
      'The type of the event (e.g., birthday, anniversary, graduation).'+
      'Use broad categories rather than specific dates for maximum suggestion quality.'
    ),
});
export type SuggestThemeTemplatesInput = z.infer<typeof SuggestThemeTemplatesInputSchema>;

const SuggestThemeTemplatesOutputSchema = z.object({
  themeTemplates: z
    .array(z.string())
    .describe(
      'An array of theme template suggestions (overlays, banners, animation styles) relevant to the event type.'
    ),
});
export type SuggestThemeTemplatesOutput = z.infer<typeof SuggestThemeTemplatesOutputSchema>;

export async function suggestThemeTemplates(
  input: SuggestThemeTemplatesInput
): Promise<SuggestThemeTemplatesOutput> {
  return suggestThemeTemplatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestThemeTemplatesPrompt',
  input: {schema: SuggestThemeTemplatesInputSchema},
  output: {schema: SuggestThemeTemplatesOutputSchema},
  prompt: `You are a creative design assistant specializing in generating theme template suggestions for various events.

  Given the event type, suggest a list of theme templates (overlays, banners, animation styles) that would be visually appealing and appropriate.
  Do not suggest specific images, just templates for digital art, such as "fireworks", "balloons", "confetti", "photo album", "animated glitter".

  Event Type: {{{eventType}}}

  Theme Template Suggestions:`, // Ensure the final output is a descriptive list of templates.
});

const suggestThemeTemplatesFlow = ai.defineFlow(
  {
    name: 'suggestThemeTemplatesFlow',
    inputSchema: SuggestThemeTemplatesInputSchema,
    outputSchema: SuggestThemeTemplatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
