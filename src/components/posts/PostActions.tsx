
import { useState } from "react";
import { Heart, MessageSquare, Repeat2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { likePost } from "@/services/posts";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialCommentsCount: number;
  onCommentClick: () => void;
}

const PostActions = ({ 
  postId, 
  initialLiked, 
  initialLikeCount, 
  initialCommentsCount, 
  onCommentClick 
}: PostActionsProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  
  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like posts");
      return;
    }
    
    try {
      const isNowLiked = await likePost(postId);
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
        title: `Post`,
        text: "Check out this post",
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
        onClick={onCommentClick}
      >
        <MessageSquare size={18} />
        {initialCommentsCount > 0 && <span className="text-xs">{initialCommentsCount}</span>}
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
  );
};

export default PostActions;
