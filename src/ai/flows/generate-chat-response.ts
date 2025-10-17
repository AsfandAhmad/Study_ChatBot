'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a chat response from the AI tutor.
 *
 * @fileOverview
 * generateChatResponse - A function that generates a helpful response to a user's message.
 * GenerateChatResponseInput - The input type for the generateChatResponse function.
 * GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChatResponseInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.array(z.object({ text: z.string() })),
    })
  ).describe("The chat history between the student and the tutor."),
  message: z.string().describe("The user's latest message."),
});

export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

export type GenerateChatResponseOutput = string;

const systemPrompt = `You are "Firefox", an AI study tutor inside a Firebase chatbot. Respond naturally and helpfully to the student’s message using your computer-science knowledge (Data Structures, Algorithms, Databases, OS, AI, Networks). Explain concepts clearly with short examples or analogies and finish with a friendly follow-up question. Do not return any stubbed or placeholder text—always give a real educational answer.`;

export async function generateChatResponse(
  input: GenerateChatResponseInput
): Promise<GenerateChatResponseOutput> {
  const { output } = await ai.generate({
    prompt: input.message,
    history: input.history,
    config: {
      system: systemPrompt,
    },
  });

  return output.text;
}
