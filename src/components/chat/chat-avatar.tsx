import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FirefoxLogo } from '@/components/icons/firefox-logo';
import { User } from 'lucide-react';
import { useUser } from '@/firebase';

interface ChatAvatarProps {
  role: 'user' | 'assistant';
}

export default function ChatAvatar({ role }: ChatAvatarProps) {
  const { user } = useUser();

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
      {user?.photoURL && (
        <AvatarImage
          src={user.photoURL}
          alt={user.displayName || 'User avatar'}
        />
      )}
      <AvatarFallback>
        <User />
      </AvatarFallback>
    </Avatar>
  );
}
