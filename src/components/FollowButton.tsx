
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { checkFollowStatus, toggleFollow } from "@/services/followService";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const FollowButton = ({
  userId,
  onFollowChange,
  className = "",
  variant = "outline",
  size = "sm"
}: FollowButtonProps) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (user && userId) {
      checkInitialFollowStatus();
    }
  }, [user, userId]);
  
  const checkInitialFollowStatus = async () => {
    try {
      const status = await checkFollowStatus(userId);
      setIsFollowing(status);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };
  
  const handleFollowToggle = async () => {
    if (!user) {
      toast.error("You must be logged in to follow users");
      return;
    }
    
    if (user.id === userId) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    try {
      setLoading(true);
      const newFollowStatus = await toggleFollow(userId);
      setIsFollowing(newFollowStatus);
      
      if (onFollowChange) {
        onFollowChange(newFollowStatus);
      }
      
      toast.success(newFollowStatus ? "Successfully followed user" : "Successfully unfollowed user");
    } catch (error) {
      console.error("Error toggling follow status:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Don't render the follow button for the current user
  if (user?.id === userId) {
    return null;
  }
  
  return (
    <Button
      variant={isFollowing ? "secondary" : variant}
      size={size}
      className={className}
      onClick={handleFollowToggle}
      disabled={loading || !user}
    >
      {isFollowing ? (
        <>
          <UserCheck size={16} className="mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus size={16} className="mr-1" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
