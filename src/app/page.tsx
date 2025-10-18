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
import { getChats, getMessages, saveChatHistory } from './actions';

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

  // Local state for the active conversation
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES);
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null);
  
  const [currentCourse, setCurrentCourse] = React.useState<Course>('GENERAL');
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  // Fetch chats for the sidebar
  const chatsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/chats`),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [user, firestore]);
  const { data: chats, isLoading: isLoadingChats } = useCollection<Chat>(chatsQuery);

  const handleSelectChat = async (chatId: string) => {
    if (!user) return;
    setCurrentChatId(chatId);
    const chat = chats?.find(c => c.id === chatId);
    if(chat) {
        setCurrentCourse(chat.course as Course);
        // Fetch the messages for the selected chat
        const fetchedMessages = await getMessages(user.uid, chatId);
        setMessages(fetchedMessages);
    }
  };

  // Logic to save the current chat when navigating away or starting a new one
  const saveCurrentChat = React.useCallback(async () => {
    // Only save if it's a new chat and has more than the initial message
    if (!currentChatId && user && messages.length > 1) {
      const newChatId = await saveChatHistory(user.uid, currentCourse, messages);
      setCurrentChatId(newChatId); // Set the new ID so we don't save it again
    }
  }, [currentChatId, user, messages, currentCourse]);
  
  const handleNewChat = () => {
    saveCurrentChat(); // Save the previous chat before starting a new one
    setCurrentChatId(null);
    setMessages(INITIAL_MESSAGES);
    setCurrentCourse('GENERAL');
  }

  // Save on unmount
  React.useEffect(() => {
    return () => {
      saveCurrentChat();
    };
  }, [saveCurrentChat]);


  if (isLoadingChats) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className='ml-2'>Loading...</p>
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
