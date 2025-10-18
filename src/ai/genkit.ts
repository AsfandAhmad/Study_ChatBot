import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {googleGenAI} from "@google/genai";
// By default, Next.js will load environment variables from .env.local
// into process.env. This is the recommended way to handle secrets.

// export const ai = new googleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!,
// });

// export const ai = genkit({
//   plugins: [
//     googleAI({
//       apiKey: process.env.GEMINI_API_KEY,
//       // possibly also a “modelBaseUrl” or “version” if needed by the plugin
//     }),
//   ],
//   model: googleAI.model('gemini-2.5-flash'),
// });


export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});


