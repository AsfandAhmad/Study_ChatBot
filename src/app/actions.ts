'use server';

import { generateAdaptiveQuizzes } from '@/ai/flows/generate-adaptive-quizzes';
import { generatePersonalizedStudyPlan } from '@/ai/flows/generate-personalized-study-plan';
import { generateChatResponse } from '@/ai/flows/generate-chat-response';
import type { Course, Message, Quiz, StudyPlan, Chat } from '@/lib/types';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { firestore } from '@/firebase/lib/firebase-admin';

// This function now resides in firebase-admin to be used on the server
async function getOrCreateChat(userId: string, course: Course, firstMessage: string): Promise<string> {
    const chatsRef = collection(firestore, `users/${userId}/chats`);
    
    // For simplicity, we'll create a new chat for each session start.
    // A more advanced implementation might look for recent existing chats.
    
    const newChat: Omit<Chat, 'id'> = {
        userProfileId: userId,
        course: course,
        title: firstMessage.substring(0, 30) + '...',
        createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(chatsRef, newChat);
    return docRef.id;
}


export async function sendMessage(
  userId: string,
  chatId: string | null,
  messages: Message[],
  newMessage: string,
  selectedCourse: Course
): Promise<{ messages: Message[]; chatId: string }> {

  let currentChatId = chatId;

  // 1. Get or create chat session
  if (!currentChatId) {
    currentChatId = await getOrCreateChat(userId, selectedCourse, newMessage);
  }

  // 2. Save user message to Firestore
  const userMessage: Omit<Message, 'id'> = {
    role: 'user',
    text: newMessage,
    course: selectedCourse,
    createdAt: serverTimestamp(),
  };

  const messagesRef = collection(firestore, `users/${userId}/chats/${currentChatId}/messages`);
  const userMessageRef = await addDoc(messagesRef, userMessage);
  
  const clientUserMessage: Message = { ...userMessage, id: userMessageRef.id, createdAt: new Date() };

  const updatedMessages = [...messages, clientUserMessage];

  // 3. Generate AI response
  const history = updatedMessages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : ('model' as 'user' | 'model'),
    content: [{ text: msg.text }],
  }));

  try {
    const replyText = await generateChatResponse({
      history,
      message: newMessage,
    });
    
    // 4. Save AI response to Firestore
    const assistantMessage: Omit<Message, 'id'> = {
      role: 'assistant',
      text: replyText,
      course: selectedCourse, // The AI can sometimes change topic, but we'll keep the session course
      createdAt: serverTimestamp(),
    };
    const assistantMessageRef = await addDoc(messagesRef, assistantMessage);
    const clientAssistantMessage: Message = { ...assistantMessage, id: assistantMessageRef.id, createdAt: new Date() };

    return { messages: [...updatedMessages, clientAssistantMessage], chatId: currentChatId };

  } catch (error: any) {
    console.error("🔥 Gemini error:", error);
    const assistantMessage: Omit<Message, 'id'> = {
      role: 'assistant',
      text: `Sorry, I encountered an error trying to respond. ${error.message || ''}`,
      course: 'GENERAL',
      createdAt: serverTimestamp(),
    };
    const assistantMessageRef = await addDoc(messagesRef, assistantMessage);
    const clientAssistantMessage: Message = { ...assistantMessage, id: assistantMessageRef.id, createdAt: new Date() };
    
    return { messages: [...updatedMessages, clientAssistantMessage], chatId: currentChatId };
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

export async function getChats(userId: string): Promise<Chat[]> {
  const chatsRef = collection(firestore, `users/${userId}/chats`);
  const q = query(chatsRef, orderBy('createdAt', 'desc'), limit(10));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
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