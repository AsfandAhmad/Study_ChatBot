'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import SidebarContent from '@/components/layout/sidebar-content';
import AppHeader from '@/components/layout/header';
import ChatPanel from '@/components/chat/chat-panel';
import type { Course, Message, Chat } from '@/lib/types';
import AuthGuard from '@/components/auth/auth-guard';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: "Hello! I'm Firefox, your personal CS tutor. I can help with Data Structures, AI, Databases, and more. What would you like to learn about today?",
    course: 'GENERAL',
    createdAt: new Date(),
  },
];

function AppContent() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES);
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null);
  
  const [currentCourse, setCurrentCourse] = React.useState<Course>('GENERAL');
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  // Fetch chats in real-time
  const chatsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/chats`),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [user, firestore]);
  const { data: chats, isLoading: isLoadingChats } = useCollection<Chat>(chatsQuery);

  // Fetch messages for the selected chat in real-time
  const messagesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !currentChatId) return null;
    return query(
      collection(firestore, `users/${user.uid}/chats/${currentChatId}/messages`),
      orderBy('createdAt', 'asc')
    );
  }, [user, firestore, currentChatId]);
  const { data: chatMessages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  // Effect to set the initial chat
  React.useEffect(() => {
    if (!isLoadingChats && chats && chats.length > 0 && !currentChatId) {
      const mostRecentChat = chats[0];
      setCurrentChatId(mostRecentChat.id);
      setCurrentCourse(mostRecentChat.course as Course);
    }
  }, [chats, isLoadingChats, currentChatId]);
  
  // Effect to update messages when a chat is selected or messages load
  React.useEffect(() => {
    if (currentChatId) {
      if (chatMessages) {
        // Map Firestore timestamps to Date objects
        setMessages(chatMessages.length > 0 ? chatMessages.map(m => ({...m, createdAt: (m.createdAt as any)?.toDate() || new Date() })) : []);
      }
    } else {
        setMessages(INITIAL_MESSAGES);
    }
  }, [chatMessages, currentChatId]);


  const handleSelectChat = (chatId: string) => {
    if (!user) return;
    setCurrentChatId(chatId);
    const chat = chats?.find(c => c.id === chatId);
    if(chat) {
        setCurrentCourse(chat.course as Course);
    }
  };
  
  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages(INITIAL_MESSAGES);
    setCurrentCourse('GENERAL');
  }

  const isLoading = isLoadingChats || (currentChatId ? isLoadingMessages : false);

  if (isLoading && !messages.length) { // Only show full-screen loader if there are no messages to display
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className='ml-2'>Loading conversation...</p>
      </div>
    );
  }

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setSidebarOpen}>
      <Sidebar>
        <SidebarContent
          chats={chats || []}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          activeChatId={currentChatId}
        />
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background">
          <AppHeader
            currentCourse={currentCourse}
            setCurrentCourse={setCurrentCourse}
            messages={messages}
          />
          <ChatPanel
            messages={messages}
            setMessages={setMessages}
            currentCourse={currentCourse}
            chatId={currentChatId}
            setChatId={setCurrentChatId}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
}
