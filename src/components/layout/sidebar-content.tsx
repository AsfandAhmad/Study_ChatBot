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

export default function SidebarContent() {
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
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Binary Search Trees" isActive>
                <span className="truncate">Binary Search Trees</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="SQL Normalization">
                <span className="truncate">SQL Normalization</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="TCP vs UDP">
                <span className="truncate">TCP vs UDP</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Save size={16}/>
            Saved Notes
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Big-O Notation Cheatsheet">
                <span className="truncate">Big-O Notation Cheatsheet</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="ACID Properties Explained">
                <span className="truncate">ACID Properties Explained</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
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
                <AvatarImage
                  src="https://picsum.photos/seed/user-avatar/40/40"
                  alt="User avatar"
                  data-ai-hint="person portrait"
                />
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
