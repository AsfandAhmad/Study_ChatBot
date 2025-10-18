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
import { History, LogOut, MessageSquarePlus, Save, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Chat } from '@/lib/types';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';
import SettingsDialog from '../settings/settings-dialog';

interface SidebarContentProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export default function SidebarContent({ chats, activeChatId, onSelectChat, onNewChat }: SidebarContentProps) {
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };

  return (
    <>
      <SidebarHeader className="p-2 border-b">
        <div className="flex items-center justify-between p-2">
          <h2 className="font-semibold text-lg">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onNewChat}>
            <MessageSquarePlus size={20} />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContentArea className="p-0">
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel className="flex items-center gap-2">
            <History size={16} />
            Chat History
          </SidebarGroupLabel>
          <SidebarMenu>
            {chats.length > 0 ? (
              chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    tooltip={chat.title}
                    isActive={chat.id === activeChatId}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <span className="truncate">{chat.title}</span>
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
            <SettingsDialog>
              <SidebarMenuButton tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SettingsDialog>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="p-2 border-t">
          {user ? (
             <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                  <AvatarFallback>{user.displayName?.[0] || user.email?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <div className="text-sm font-semibold truncate">{user.displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8">
                  <LogOut size={16} />
                </Button>
             </div>
          ) : (
            <div className="text-sm text-muted-foreground">Not signed in</div>
          )}
        </div>
      </SidebarFooter>
    </>
  );
}
