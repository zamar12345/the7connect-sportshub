
import { useState } from "react";
import { likePost } from "@/services/posts";
import { createLikeNotification, deleteLikeNotification } from "@/services/posts/notificationService";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

interface UsePostActionsProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
}

export const usePostActions = ({
  postId,
  initialLiked,
  initialLikeCount,
}: UsePostActionsProps) => {
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
      
      // Update UI state
      setLiked(isNowLiked);
      setLikeCount(prev => isNowLiked ? prev + 1 : prev - 1);
      
      // Create or delete notification
      if (isNowLiked) {
        await createLikeNotification(postId);
      } else {
        await deleteLikeNotification(postId);
      }
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
  
  return {
    liked,
    likeCount,
    reposted,
    repostCount,
    handleLike,
    handleRepost,
    handleShare,
  };
};
