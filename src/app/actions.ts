'use server';

import { generateAdaptiveQuizzes } from '@/ai/flows/generate-adaptive-quizzes';
import { generatePersonalizedStudyPlan } from '@/ai/flows/generate-personalized-study-plan';
import { generateChatResponse } from '@/ai/flows/generate-chat-response';
import type { Course, Message, Quiz, StudyPlan } from '@/lib/types';

// Stub for routing logic as described in the proposal
function getRouteForMessage(message: string): Course {
  if (/stack|queue|tree|graph|complexity|dp/i.test(message)) return 'DSA';
  if (/ai|ml|neural|regression|loss|gradient|epoch/i.test(message)) return 'AI';
  if (/sql|index|er|normal|acid|transaction/i.test(message)) return 'DBMS';
  if (/process|thread|schedule|deadlock|paging|memory/i.test(message)) return 'OS';
  if (/tcp|udp|http|dns|ip|osi|routing/i.test(message)) return 'NET';
  return 'GENERAL';
}

export async function sendMessage(
  messages: Message[],
  newMessage: string,
  selectedCourse: Course
): Promise<Message[]> {
  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    text: newMessage,
    course: selectedCourse,
  };

  const updatedMessages = [...messages, userMessage];

  const history = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : ('model' as 'user' | 'model'),
    content: [{ text: msg.text }],
  }));

  const routedCourse = getRouteForMessage(newMessage);

  try {
    const replyText = await generateChatResponse({
      history,
      message: newMessage,
    });

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: replyText,
      course: routedCourse,
    };

    return [...updatedMessages, assistantMessage];
  } catch (error: any) {
    console.error("🔥 Gemini error:", error);
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: `Sorry, I encountered an error trying to respond. ${error.message || ''}`,
      course: 'GENERAL',
    };
    return [...updatedMessages, assistantMessage];
  }
}

export async function generateQuizAction(
  messages: Message[],
  course: Course
): Promise<Quiz> {
  const chatHistory = messages.slice(-10).map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    text: msg.text,
    course: msg.course || course,
  }));

  if (chatHistory.length === 0) {
    chatHistory.push({
      role: 'user',
      text: `Give me a quiz on ${course}`,
      course: course,
    });
  }

  try {
    const quiz = await generateAdaptiveQuizzes({
      chatHistory,
      course,
    });
    if (!quiz.questions || quiz.questions.length === 0) {
      throw new Error('AI returned an empty quiz.');
    }
    return quiz;
  } catch (error) {
    console.error('Error generating quiz:', error);
    // Return a dummy quiz on error to maintain UI flow
    return {
      questions: [
        {
          q: 'What is the time complexity of binary search?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          answer: 'O(log n)',
          why: 'The input array is halved at each step of the algorithm.',
        },
        {
          q: 'Which of these is not a pillar of OOP?',
          options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Compilation'],
          answer: 'Compilation',
          why: 'Compilation is a step in the software development process, not a principle of Object-Oriented Programming.',
        },
      ],
    };
  }
}

export async function generateStudyPlanAction(
  course: Course
): Promise<StudyPlan> {
  try {
    const plan = await generatePersonalizedStudyPlan({ course });
    return plan;
  } catch (error) {
    console.error('Error generating study plan:', error);
    // Return a dummy plan on error
    return {
      plan: Array.from({ length: 7 }).map((_, i) => ({
        day: i + 1,
        minutes: (i + 1) * 10 + 20,
        topics: [
          `Review ${course} fundamentals`,
          'Complete one practice problem',
          'Watch a short video on a key concept',
        ],
      })),
    };
  }
}
