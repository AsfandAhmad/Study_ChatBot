import type { GenerateAdaptiveQuizzesOutput } from '@/ai/flows/generate-adaptive-quizzes';
import type { GeneratePersonalizedStudyPlanOutput } from '@/ai/flows/generate-personalized-study-plan';

export type Course = 'GENERAL' | 'DSA' | 'AI' | 'DBMS' | 'OS' | 'NET';

export const courses: { value: Course; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'DSA', label: 'Data Structures & Algorithms' },
  { value: 'AI', label: 'AI/ML' },
  { value: 'DBMS', label: 'Database Systems' },
  { value: 'OS', label: 'Operating Systems' },
  { value: 'NET', label: 'Networks' },
];

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  course?: Course;
}

export type Quiz = GenerateAdaptiveQuizzesOutput;
export type QuizQuestion = Quiz['questions'][0];

export type StudyPlan = GeneratePersonalizedStudyPlanOutput;
