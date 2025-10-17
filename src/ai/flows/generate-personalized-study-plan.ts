// src/ai/flows/generate-personalized-study-plan.ts
'use server';
/**
 * @fileOverview Generates a personalized 7-day study plan for a given course.
 *
 * - generatePersonalizedStudyPlan - A function that generates the study plan.
 * - GeneratePersonalizedStudyPlanInput - The input type for the generatePersonalizedStudyPlan function.
 * - GeneratePersonalizedStudyPlanOutput - The return type for the generatePersonalizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedStudyPlanInputSchema = z.object({
  course: z
    .enum(['DSA', 'AI', 'DBMS', 'OS', 'NET', 'GENERAL'])
    .describe('The course for which to generate the study plan.'),
});
export type GeneratePersonalizedStudyPlanInput = z.infer<
  typeof GeneratePersonalizedStudyPlanInputSchema
>;

const GeneratePersonalizedStudyPlanOutputSchema = z.object({
  plan: z
    .array(
      z.object({
        day: z.number().describe('The day number (1-7).'),
        minutes: z.number().describe('Estimated study time in minutes for the day.'),
        topics: z.array(z.string()).describe('List of topics to study for the day.'),
      })
    )
    .describe('A 7-day study plan.'),
});
export type GeneratePersonalizedStudyPlanOutput = z.infer<
  typeof GeneratePersonalizedStudyPlanOutputSchema
>;

export async function generatePersonalizedStudyPlan(
  input: GeneratePersonalizedStudyPlanInput
): Promise<GeneratePersonalizedStudyPlanOutput> {
  return generatePersonalizedStudyPlanFlow(input);
}

const generatePersonalizedStudyPlanPrompt = ai.definePrompt({
  name: 'generatePersonalizedStudyPlanPrompt',
  input: {schema: GeneratePersonalizedStudyPlanInputSchema},
  output: {schema: GeneratePersonalizedStudyPlanOutputSchema},
  prompt: `You are an AI study plan generator. You will generate a 7-day study plan for the student, based on the selected course.

Course: {{{course}}}

The study plan should include:
- Day number (1-7)
- Estimated study time in minutes for the day (total/day <= 90).
- List of topics to study for the day.

Ensure the plan is realistic and achievable, and that it covers a range of topics relevant to the course.

Output the plan in JSON format.`,
});

const generatePersonalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedStudyPlanFlow',
    inputSchema: GeneratePersonalizedStudyPlanInputSchema,
    outputSchema: GeneratePersonalizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await generatePersonalizedStudyPlanPrompt(input);
    return output!;
  }
);
