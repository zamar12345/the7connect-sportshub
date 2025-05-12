
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface PostHeaderProps {
  user: PostUser;
  timestamp: string;
}

const PostHeader = ({ user, timestamp }: PostHeaderProps) => {
  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return `${diffSec}s`;
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="flex space-x-3">
      <Avatar className="w-10 h-10">
        <AvatarImage src={user.avatar_url} alt={user.full_name} />
        <AvatarFallback>{user.full_name?.[0] || user.username?.[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex items-center">
        <p className="font-semibold text-foreground truncate mr-1.5">
          {user.full_name || user.username}
        </p>
        <p className="text-muted-foreground text-sm truncate ml-1">
          @{user.username} · {formatTimestamp(timestamp)}
        </p>
      </div>
    </div>
  );
};

export default PostHeader;
