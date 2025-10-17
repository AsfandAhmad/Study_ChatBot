'use client';

import * as React from 'react';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import type { Message, Course } from '@/lib/types';
import { sendMessage } from '@/app/actions';

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

  const handleSendMessage = async (newMessage: string) => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        text: newMessage,
        course: currentCourse,
      },
    ]);

    const updatedMessages = await sendMessage(
      messages,
      newMessage,
      currentCourse
    );
    // In a real app, you might get a stream of tokens.
    // For this stub, we just replace the whole message list.
    setMessages(updatedMessages);
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
