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
  chatId: string | null;
  setChatId: React.Dispatch<React.SetStateAction<string | null>>;
  onNewChatCreated: (chatId: string) => void;
}

export default function ChatPanel({
  messages,
  setMessages,
  currentCourse,
  chatId,
  setChatId,
  onNewChatCreated,
}: ChatPanelProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { user } = useAuth();

  const handleSendMessage = async (newMessage: string) => {
    if (!user) return;

    setIsLoading(true);

    const optimisticUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: newMessage,
      course: currentCourse,
      createdAt: new Date(),
    };
    
    setMessages((prev) => [...prev, optimisticUserMessage]);

    const { messages: updatedMessages, chatId: newChatId } = await sendMessage(
      user.uid,
      chatId,
      messages,
      newMessage,
      currentCourse
    );
    
    setMessages(updatedMessages);

    if (!chatId && newChatId) {
      onNewChatCreated(newChatId);
    }
    
    setIsLoading(false);
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
