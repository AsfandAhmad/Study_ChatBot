'use client';

import * as React from 'react';
import type { Message } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ChatAvatar from './chat-avatar';
import { Skeleton } from '../ui/skeleton';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1" viewportRef={viewportRef}>
      <div className="space-y-6 p-4 md:p-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && <ChatAvatar role="assistant" />}
            <div
              className={cn(
                'max-w-xs rounded-2xl p-3 text-sm shadow-md md:max-w-md lg:max-w-2xl',
                message.role === 'user'
                  ? 'rounded-br-none bg-primary text-primary-foreground'
                  : 'rounded-bl-none bg-card text-card-foreground',
                message.role === 'assistant' &&
                  'shadow-[0_0_15px_2px_hsl(var(--chart-1)/0.4)] dark:shadow-[0_0_20px_3px_hsl(var(--chart-5)/0.4)]'
              )}
            >
              <p className="whitespace-pre-wrap font-body">{message.text}</p>
              {message.course && message.course !== 'GENERAL' && (
                <div className="mt-2 text-xs opacity-70 font-mono">{message.course}</div>
              )}
            </div>
            {message.role === 'user' && <ChatAvatar role="user" />}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start justify-start gap-3">
            <ChatAvatar role="assistant" />
            <div className="rounded-2xl rounded-bl-none bg-card p-3 shadow-md">
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
