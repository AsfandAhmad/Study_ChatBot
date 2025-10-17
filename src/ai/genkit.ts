import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// By default, Next.js will load environment variables from .env.local
// into process.env. This is the recommended way to handle secrets.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
