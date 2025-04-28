
import { useState } from "react";
import { Heart, MessageSquare, Repeat2, Share } from "lucide-react";
import { Post } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [reposted, setReposted] = useState(post.reposted || false);
  const [repostCount, setRepostCount] = useState(post.reposts);

  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleRepost = () => {
    if (reposted) {
      setRepostCount(prev => prev - 1);
    } else {
      setRepostCount(prev => prev + 1);
    }
    setReposted(!reposted);
  };

  return (
    <div className="border-b border-border p-4">
      <div className="flex space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.user.avatar} alt={post.user.name} />
          <AvatarFallback>{post.user.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className="font-semibold text-foreground truncate mr-1.5">
              {post.user.name}
            </p>
            {post.user.isVerified && (
              <span className="text-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
            <p className="text-muted-foreground text-sm truncate ml-1">
              @{post.user.username} · {post.timestamp}
            </p>
          </div>
          
          <p className="mt-1 mb-2 text-foreground whitespace-pre-wrap">{post.content}</p>
          
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.hashtags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 hover:bg-primary/20 text-primary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          {post.images && post.images.length > 0 && (
            <div className="mt-2 mb-3 rounded-xl overflow-hidden">
              <img 
                src={post.images[0]} 
                alt="Post content" 
                className="w-full object-cover rounded-xl"
                style={{ maxHeight: "280px" }}
              />
            </div>
          )}
          
          <div className="flex justify-between mt-3 text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("gap-1 px-2", liked && "text-sport-orange")}
              onClick={handleLike}
            >
              <Heart size={18} className={cn(liked && "fill-sport-orange")} />
              {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-1 px-2">
              <MessageSquare size={18} />
              {post.comments > 0 && <span className="text-xs">{post.comments}</span>}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("gap-1 px-2", reposted && "text-sport-green")}
              onClick={handleRepost}
            >
              <Repeat2 size={18} className={cn(reposted && "text-sport-green")} />
              {repostCount > 0 && <span className="text-xs">{repostCount}</span>}
            </Button>
            
            <Button variant="ghost" size="sm" className="px-2">
              <Share size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
