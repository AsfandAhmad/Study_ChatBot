'use server';

import { generateAdaptiveQuizzes } from '@/ai/flows/generate-adaptive-quizzes';
import { generatePersonalizedStudyPlan } from '@/ai/flows/generate-personalized-study-plan';
import { generateChatResponse } from '@/ai/flows/generate-chat-response';
import type { Course, Message, Quiz, StudyPlan, Chat } from '@/lib/types';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit, Timestamp, writeBatch } from 'firebase/firestore';
import { firestore } from '@/firebase/lib/firebase-admin';


export async function sendMessage(
  historyForAI: { role: 'user' | 'model', content: {text: string}[] }[],
  newMessage: string,
): Promise<string> {

  // 1. Generate AI response
  try {
    const replyText = await generateChatResponse({
      history: historyForAI,
      message: newMessage,
    });
    return replyText;
  } catch (error: any) {
    console.error("🔥 Gemini error:", error);
    return `Sorry, I encountered an error trying to respond. ${error.message || ''}`;
  }
}

export async function saveChatHistory(userId: string, course: Course, messages: Message[]): Promise<string> {
    if (messages.length <= 1) { // Don't save if only initial message
        throw new Error("Not enough messages to save.");
    }
    
    const chatsRef = collection(firestore, `users/${userId}/chats`);
    
    // Create new chat document
    const newChatData = {
        userProfileId: userId,
        course: course,
        title: messages[1]?.text.substring(0, 30) + '...' || 'New Chat', // Use first user message for title
        createdAt: serverTimestamp(),
    };
    
    const chatDocRef = await addDoc(chatsRef, newChatData);
    const chatId = chatDocRef.id;

    // Use a batch write to save all messages at once
    const batch = writeBatch(firestore);
    const messagesRef = collection(firestore, `users/${userId}/chats/${chatId}/messages`);

    messages.forEach(message => {
        // Don't save the initial placeholder message if it's the default one
        if(message.id === '1' && message.text.startsWith("Hello! I'm Firefox")) {
          return;
        }
        const docRef = doc(messagesRef); // Create a new doc with a random ID
        const messageData = {
          ...message,
          createdAt: serverTimestamp(), // Use server timestamp for consistency
        }
        delete (messageData as any).id; // Remove the temporary client-side ID
        batch.set(docRef, messageData);
    });

    await batch.commit();

    return chatId;
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
    return {
      title: `Generated Plan for ${course}`,
      course: course,
      plan: plan.plan,
    }
  } catch (error) {
    console.error('Error generating study plan:', error);
    // Return a dummy plan on error
    return {
      title: `Error Plan`,
      course: course,
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

export async function getChats(userId: string): Promise<Chat[]> {
  const chatsRef = collection(firestore, `users/${userId}/chats`);
  const q = query(chatsRef, orderBy('createdAt', 'desc'), limit(10));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp),
  } as Chat));
}

export async function getMessages(userId: string, chatId: string): Promise<Message[]> {
  const messagesRef = collection(firestore, `users/${userId}/chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to Date
      createdAt: (data.createdAt as any).toDate(),
    } as Message;
  });
}
