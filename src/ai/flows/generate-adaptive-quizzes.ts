'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating adaptive multiple-choice quizzes.
 *
 * The flow takes chat history and a course as input and returns a set of multiple-choice questions.
 *
 * @fileOverview
 * generateAdaptiveQuizzes - A function that generates adaptive multiple-choice quizzes.
 * GenerateAdaptiveQuizzesInput - The input type for the generateAdaptiveQuizzes function.
 * GenerateAdaptiveQuizzesOutput - The return type for the generateAdaptiveQuizzes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdaptiveQuizzesInputSchema = z.object({
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      text: z.string(),
      course: z.string(),
    })
  ).describe('The recent chat history between the student and the tutor.'),
  course: z.string().describe('The course for which to generate the quiz.'),
});
export type GenerateAdaptiveQuizzesInput = z.infer<typeof GenerateAdaptiveQuizzesInputSchema>;

const GenerateAdaptiveQuizzesOutputSchema = z.object({
  questions: z.array(
    z.object({
      q: z.string().describe('The question text.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      answer: z.string().describe('The correct answer.'),
      why: z.string().describe('The explanation for why the answer is correct.'),
    })
  ).describe('The generated multiple-choice questions.'),
});
export type GenerateAdaptiveQuizzesOutput = z.infer<typeof GenerateAdaptiveQuizzesOutputSchema>;

export async function generateAdaptiveQuizzes(input: GenerateAdaptiveQuizzesInput): Promise<GenerateAdaptiveQuizzesOutput> {
  return generateAdaptiveQuizzesFlow(input);
}

const generateAdaptiveQuizzesPrompt = ai.definePrompt({
  name: 'generateAdaptiveQuizzesPrompt',
  input: {schema: GenerateAdaptiveQuizzesInputSchema},
  output: {schema: GenerateAdaptiveQuizzesOutputSchema},
  prompt: `You are an evaluation agent that generates multiple-choice questions based on a student's chat history and course.

  Your goal is to assess the student's understanding of the material covered in the chat history.
  Generate 3-5 multiple-choice questions that are relevant to the chat history and the specified course.

  Each question should have 4 answer options, with only one correct answer.
  Provide a brief explanation for why the correct answer is correct.

  Chat History:
  {{#each chatHistory}}
  {{role}}: {{text}} (Course: {{course}})
  {{/each}}

  Course: {{course}}

  Output the questions in the following JSON format:
  {
    "questions": [
      {
        "q": "question text",
        "options": ["option1", "option2", "option3", "option4"],
        "answer": "correct answer",
        "why": "explanation for why the answer is correct"
      }
    ]
  }`,
});

const generateAdaptiveQuizzesFlow = ai.defineFlow(
  {
    name: 'generateAdaptiveQuizzesFlow',
    inputSchema: GenerateAdaptiveQuizzesInputSchema,
    outputSchema: GenerateAdaptiveQuizzesOutputSchema,
  },
  async input => {
    const {output} = await generateAdaptiveQuizzesPrompt(input);
    return output!;
  }
);
