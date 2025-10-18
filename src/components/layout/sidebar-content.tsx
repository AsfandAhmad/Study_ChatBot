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
import { History, LogOut, Save, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Message } from '@/lib/types';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';

interface SidebarContentProps {
  messages: Message[];
}

export default function SidebarContent({ messages }: SidebarContentProps) {
  const { user } = useUser();
  const auth = useAuth();
  
  // Create a list of unique conversation starters from user messages
  const chatHistory = messages
    .filter((message) => message.role === 'user')
    .slice(-5) // get last 5 user messages
    .reverse();

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };

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
