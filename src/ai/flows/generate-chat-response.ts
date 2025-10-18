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

const systemPrompt = `You are "Firefox", an AI study tutor inside a Firebase chatbot...`;

export async function generateChatResponse(
  input: GenerateChatResponseInput
): Promise<GenerateChatResponseOutput> {
  const messages = [
    { role: 'system', content: [{ text: systemPrompt }] },
    ...(input.history?.map((m) => ({
      role: m.role,
      content: [{ text: m.content.map((c) => c.text).join(' ') }],
    })) ?? []),
    { role: 'user', content: [{ text: input.message }] },
  ];

  const response = await ai.generate({
    model: googleAI.model('gemini-2.0-flash'),
    messages,
  });

  // ✅ Extract the AI reply text safely (covers both Genkit formats)
  const text =
    response?.output?.text ??
    response?.message?.content?.[0]?.text ??
    response?.output?.[0]?.content?.[0]?.text ??
    '';

  return text.trim();
}
