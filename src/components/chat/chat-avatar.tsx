import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FirefoxLogo } from '@/components/icons/firefox-logo';
import { User } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ChatAvatarProps {
  role: 'user' | 'assistant';
}

export default function ChatAvatar({ role }: ChatAvatarProps) {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

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
      {userAvatar && (
        <AvatarImage
          src={userAvatar.imageUrl}
          alt={userAvatar.description}
          data-ai-hint={userAvatar.imageHint}
        />
      )}
      <AvatarFallback>
        <User />
      </AvatarFallback>
    </Avatar>
  );
}
