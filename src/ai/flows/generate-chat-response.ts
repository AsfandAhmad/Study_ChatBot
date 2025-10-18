'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateChatResponseInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({ text: z.string() })),
      })
    )
    .optional(),
  message: z.string(),
});

export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;
export type GenerateChatResponseOutput = string;

const systemPrompt = `You are "Firefox", an AI study tutor inside a Firebase chatbot. Your goal is to help computer science students learn various subjects. Be friendly, encouraging, and provide clear, concise explanations. Ask clarifying questions to better understand the student's needs. When explaining code, use markdown code blocks. Keep your responses focused on the student's question and the selected course topic.`;

export async function generateChatResponse(
  input: GenerateChatResponseInput
): Promise<GenerateChatResponseOutput> {
  const messages = [
    ...(input.history?.map((m) => ({
      role: m.role,
      content: [{ text: m.content.map((c) => c.text).join(' ') }],
    })) ?? []),
    { role: 'user', content: [{ text: input.message }] },
  ];

  const response = await ai.generate({
    model: googleAI.model('gemini-2.0-flash'),
    prompt: input.message,
    history: input.history,
    system: systemPrompt,
  });

  // ✅ Extract the AI reply text safely
  const text = response.text;

  return text.trim();
}
