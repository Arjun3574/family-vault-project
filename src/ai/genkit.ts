import {genkit} from 'genkit';
import {googleAI} from '@gen-ai/google-genai';
import {firebase} from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [googleAI(), firebase()],
  model: 'googleai/gemini-2.5-flash',
});
