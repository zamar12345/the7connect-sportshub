
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { checkPostLikedStatus } from "@/services/posts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommentSection from "@/components/CommentSection";
import PostHeader from "@/components/posts/PostHeader";
import PostContent from "@/components/posts/PostContent";
import PostActions from "@/components/posts/PostActions";

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

  return (
    <div className="border-b border-border p-4">
      <div className="flex flex-col space-y-3">
        <PostHeader user={post.user} timestamp={post.created_at} />
        
        <div className="flex-1 min-w-0">
          <PostContent 
            content={post.content} 
            hashtags={post.hashtags} 
            image_url={post.image_url}
            video_url={post.video_url}
          />
          
          <PostActions 
            postId={post.id}
            initialLiked={liked}
            initialLikeCount={post.likes_count || 0}
            initialCommentsCount={post.comments_count || 0}
            onCommentClick={() => setCommentsOpen(true)}
          />
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
