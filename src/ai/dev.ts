import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/generate-adaptive-quizzes.ts';
import '@/ai/flows/generate-personalized-study-plan.ts';
import '@/ai/flows/generate-chat-response.ts';
