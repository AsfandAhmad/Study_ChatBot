import {
  SidebarHeader,
  SidebarContent as SidebarContentArea,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { History, Save, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Message } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface SidebarContentProps {
  messages: Message[];
}

export default function SidebarContent({ messages }: SidebarContentProps) {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  // Create a list of unique conversation starters from user messages
  const chatHistory = messages
    .filter((message) => message.role === 'user')
    .slice(-5) // get last 5 user messages
    .reverse();

  return (
    <>
      <SidebarHeader className="p-2 border-b">
        <div className="flex items-center gap-2 p-2">
          <h2 className="font-semibold text-lg">Menu</h2>
        </div>
      </SidebarHeader>
      <SidebarContentArea className="p-0">
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel className="flex items-center gap-2">
            <History size={16} />
            Chat History
          </SidebarGroupLabel>
          <SidebarMenu>
            {chatHistory.length > 0 ? (
              chatHistory.map((message) => (
                <SidebarMenuItem key={message.id}>
                  <SidebarMenuButton
                    tooltip={message.text}
                    isActive={false} // You could make this active based on a selected chat
                  >
                    <span className="truncate">{message.text}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="px-3 text-sm text-muted-foreground">
                No recent history.
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Save size={16} />
            Saved Notes
          </SidebarGroupLabel>
           <div className="px-3 text-sm text-muted-foreground">
              No saved notes yet.
            </div>
        </SidebarGroup>
      </SidebarContentArea>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Profile">
              <Avatar className="h-6 w-6">
                {userAvatar && (
                  <AvatarImage
                    src={userAvatar.imageUrl}
                    alt={userAvatar.description}
                    data-ai-hint={userAvatar.imageHint}
                  />
                )}
                <AvatarFallback>
                  <User size={14} />
                </AvatarFallback>
              </Avatar>
              <span>User Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
