import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Next.js automatically loads .env.local. No need for dotenv.

export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY, // API key is read from environment
  })],
  model: 'googleai/gemini-2.5-flash',
});
