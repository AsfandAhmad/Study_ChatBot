'use client';

import * as React from 'react';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import type { Message, Course } from '@/lib/types';
import { sendMessage } from '@/app/actions';
import { useAuth } from '@/firebase';

interface ChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentCourse: Course;
}

export default function ChatPanel({
  messages,
  setMessages,
  currentCourse,
}: ChatPanelProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { user } = useAuth();

  const handleSendMessage = async (newMessageText: string) => {
    if (!user) return;

    const optimisticUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: newMessageText,
      course: currentCourse,
      createdAt: new Date(),
    };
    
    // Add user message to local state and set loading
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setIsLoading(true);

    // Prepare the history for the AI, excluding the optimistic message
    const historyForAI = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : ('model' as 'user' | 'model'),
        content: [{ text: msg.text }],
      }));

    try {
      // Call the server action to get AI response
      const replyText = await sendMessage(
        historyForAI,
        newMessageText,
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: replyText,
        course: currentCourse,
        createdAt: new Date(),
      };
      
      // Add AI message to local state
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
       console.error("Failed to send message:", error);
       const errorMessage: Message = {
         id: crypto.randomUUID(),
         role: 'assistant',
         text: "Sorry, I couldn't get a response. Please try again.",
         course: 'GENERAL',
         createdAt: new Date(),
       };
       setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatMessages messages={messages} isLoading={isLoading} />
      <div className="border-t bg-background px-4 py-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
