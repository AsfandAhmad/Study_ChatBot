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
import { Loader2 } from 'lucide-react';

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
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES);
  const [currentCourse, setCurrentCourse] = React.useState<Course>('GENERAL');
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  
  const handleNewChat = () => {
    setMessages(INITIAL_MESSAGES);
    setCurrentCourse('GENERAL');
  }

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setSidebarOpen}>
      <Sidebar>
        <SidebarContent
          chats={[]}
          onSelectChat={() => {}}
          onNewChat={handleNewChat}
          activeChatId={null}
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
