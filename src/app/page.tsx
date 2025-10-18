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
import { useAuth } from '@/firebase';
import { getChats, getMessages } from './actions';
import { Loader2 } from 'lucide-react';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: "Hello! I'm Firefox, your personal CS tutor. I can help with Data Structures, AI, Databases, and more. What would you like to learn about today?",
    course: 'GENERAL',
  },
];

function AppContent() {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);

  const [currentCourse, setCurrentCourse] = React.useState<Course>('GENERAL');
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      setIsLoadingHistory(true);
      getChats(user.uid)
        .then(userChats => {
          setChats(userChats);
          if (userChats.length > 0) {
            const mostRecentChat = userChats[0];
            setCurrentChatId(mostRecentChat.id);
            setCurrentCourse(mostRecentChat.course as Course);
            return getMessages(user.uid, mostRecentChat.id);
          }
          return [];
        })
        .then(chatMessages => {
          if (chatMessages.length > 0) {
            setMessages(chatMessages);
          } else {
            setMessages(INITIAL_MESSAGES);
          }
        })
        .finally(() => {
          setIsLoadingHistory(false);
        });
    }
  }, [user]);

  const handleSelectChat = async (chatId: string) => {
    if (!user) return;
    setIsLoadingHistory(true);
    setCurrentChatId(chatId);
    const chat = chats.find(c => c.id === chatId);
    if(chat) {
        setCurrentCourse(chat.course as Course);
    }
    const newMessages = await getMessages(user.uid, chatId);
    setMessages(newMessages);
    setIsLoadingHistory(false);
  };
  
  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages(INITIAL_MESSAGES);
    setCurrentCourse('GENERAL');
  }

  if (isLoadingHistory) {
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
          chats={chats}
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
            onNewChatCreated={(newChatId) => {
              // Refresh chat list after a new one is made
              if(user) getChats(user.uid).then(setChats);
              setCurrentChatId(newChatId);
            }}
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
