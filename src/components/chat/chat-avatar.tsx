import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FirefoxLogo } from '@/components/icons/firefox-logo';
import { User } from 'lucide-react';

interface ChatAvatarProps {
  role: 'user' | 'assistant';
}

export default function ChatAvatar({ role }: ChatAvatarProps) {
  if (role === 'assistant') {
    return (
      <Avatar className="bg-card border-2 border-primary/50">
        <AvatarFallback className="bg-primary/10">
          <FirefoxLogo className="text-primary" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar>
      <AvatarImage
        src="https://picsum.photos/seed/user-avatar/40/40"
        alt="User avatar"
        data-ai-hint="person portrait"
      />
      <AvatarFallback>
        <User />
      </AvatarFallback>
    </Avatar>
  );
}
