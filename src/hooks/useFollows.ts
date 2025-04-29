
import { useState } from "react";
import { getFollowersList, getFollowingList } from "@/services/followService";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

interface User {
  id: string;
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

export function useFollows(userId?: string) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const { user } = useAuth();
  
  const fetchFollowers = async (targetUserId?: string) => {
    try {
      setLoadingFollowers(true);
      const userIdToFetch = targetUserId || userId || user?.id;
      
      if (!userIdToFetch) {
        toast.error("User not authenticated");
        return;
      }
      
      const followersList = await getFollowersList(userIdToFetch);
      setFollowers(followersList);
    } catch (error: any) {
      console.error("Error fetching followers:", error);
      toast.error(`Error fetching followers: ${error.message}`);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      setLoadingFollowing(true);
      
      if (!user) {
        toast.error("User not authenticated");
        return;
      }
      
      const followingList = await getFollowingList();
      setFollowing(followingList);
    } catch (error: any) {
      console.error("Error fetching following list:", error);
      toast.error(`Error fetching following list: ${error.message}`);
    } finally {
      setLoadingFollowing(false);
    }
  };

  return {
    followers,
    following,
    loadingFollowers,
    loadingFollowing,
    fetchFollowers,
    fetchFollowing
  };
}
