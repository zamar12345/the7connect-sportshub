
import { useState, useEffect } from "react";
import { Heart, MessageSquare, Repeat2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { likePost, checkPostLikedStatus } from "@/services/postService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommentSection from "@/components/CommentSection";

interface PostUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    image_url?: string;
    video_url?: string;
    user: PostUser;
    hashtags?: string[];
    likes_count?: number;
    comments_count?: number;
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  
  useEffect(() => {
    // Check if the current user has liked this post
    const checkLiked = async () => {
      if (user) {
        try {
          const isLiked = await checkPostLikedStatus(post.id);
          setLiked(isLiked);
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      }
    };
    
    checkLiked();
  }, [post.id, user]);
  
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
  
  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like posts");
      return;
    }
    
    try {
      const isNowLiked = await likePost(post.id);
      setLiked(isNowLiked);
      setLikeCount(prev => isNowLiked ? prev + 1 : prev - 1);
    } catch (error: any) {
      console.error("Error liking post:", error);
      toast.error(`Error: ${error.message}`);
    }
  };
  
  const handleRepost = () => {
    if (!user) {
      toast.error("You must be logged in to repost");
      return;
    }
    
    if (reposted) {
      setRepostCount(prev => prev - 1);
    } else {
      setRepostCount(prev => prev + 1);
      toast.success("Post reposted to your profile");
    }
    setReposted(!reposted);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.user.username}`,
        text: post.content,
        url: window.location.href,
      }).catch(error => {
        console.error("Error sharing:", error);
        toast.error("Couldn't share the post");
      });
    } else {
      toast.info("Sharing not supported on this device");
    }
  };

  return (
    <div className="border-b border-border p-4">
      <div className="flex space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.user.avatar_url} alt={post.user.full_name} />
          <AvatarFallback>{post.user.full_name?.[0] || post.user.username?.[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className="font-semibold text-foreground truncate mr-1.5">
              {post.user.full_name || post.user.username}
            </p>
            <p className="text-muted-foreground text-sm truncate ml-1">
              @{post.user.username} · {formatTimestamp(post.created_at)}
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
          
          {post.image_url && (
            <div className="mt-2 mb-3 rounded-xl overflow-hidden">
              <img 
                src={post.image_url} 
                alt="Post content" 
                className="w-full object-cover rounded-xl"
                style={{ maxHeight: "280px" }}
              />
            </div>
          )}
          
          {post.video_url && (
            <div className="mt-2 mb-3 rounded-xl overflow-hidden">
              <video 
                src={post.video_url} 
                controls
                className="w-full rounded-xl"
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
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 px-2"
              onClick={() => setCommentsOpen(true)}
            >
              <MessageSquare size={18} />
              {post.comments_count > 0 && <span className="text-xs">{post.comments_count}</span>}
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
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2"
              onClick={handleShare}
            >
              <Share size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <CommentSection postId={post.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostCard;
