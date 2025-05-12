
import { Heart, MessageSquare, Repeat2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePostActions } from "@/hooks/usePostActions";

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
  const {
    liked,
    likeCount,
    reposted,
    repostCount,
    handleLike,
    handleRepost,
    handleShare
  } = usePostActions({
    postId,
    initialLiked,
    initialLikeCount
  });
  
  return (
    <div className="flex justify-between mt-3 text-muted-foreground">
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "gap-1 px-2 rounded-full transition-all", 
          liked ? "text-sport-orange" : "group-hover:bg-sport-orange/10"
        )}
        onClick={handleLike}
      >
        <Heart 
          size={18} 
          className={cn(
            "transition-all", 
            liked ? "fill-sport-orange" : "group-hover:text-sport-orange"
          )} 
        />
        {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-1 px-2 rounded-full group-hover:bg-primary/10 transition-all"
        onClick={onCommentClick}
      >
        <MessageSquare size={18} className="group-hover:text-primary transition-colors" />
        {initialCommentsCount > 0 && <span className="text-xs">{initialCommentsCount}</span>}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "gap-1 px-2 rounded-full transition-all", 
          reposted ? "text-sport-green" : "group-hover:bg-sport-green/10"
        )}
        onClick={handleRepost}
      >
        <Repeat2 
          size={18} 
          className={cn(
            "transition-all", 
            reposted ? "text-sport-green" : "group-hover:text-sport-green"
          )} 
        />
        {repostCount > 0 && <span className="text-xs">{repostCount}</span>}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="px-2 rounded-full group-hover:bg-accent/20 transition-all"
        onClick={handleShare}
      >
        <Share size={18} className="group-hover:text-accent-foreground transition-colors" />
      </Button>
    </div>
  );
};

export default PostActions;
