
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import MobileLayout from "@/components/layout/MobileLayout";
import { mockPosts } from "@/data/mockData";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileEditor from "@/components/ProfileEditor";
import { ProfileData } from "@/types/profile";
import { parseAchievements, parseStats } from "@/utils/profileUtils";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { fetchPosts } from "@/services/postService";

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // If there's an ID param, fetch that profile, otherwise fetch the current user's profile
        const profileId = id || user?.id;
        
        if (!profileId) {
          // No ID provided and user not logged in
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", profileId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfileData({
            id: data.id,
            username: data.username || "",
            full_name: data.full_name || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
            sport: data.sport || "",
            disciplines: data.disciplines || [],
            followers: data.followers || 0,
            following: data.following || 0,
            achievements: parseAchievements(data.achievements),
            stats: parseStats(data.stats)
          });
          
          // Fetch user posts
          const userPostsData = await fetchPosts({ userId: profileId });
          setUserPosts(userPostsData);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast.error(`Error loading profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, id, isEditorOpen]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  if (!user && !id) {
    // No user logged in and no profile ID to view
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-112px)]">
          <p className="text-lg font-semibold mb-2">Sign in to view your profile</p>
          <p className="text-muted-foreground text-center">
            Create an account or sign in to see your profile.
          </p>
        </div>
      </MobileLayout>
    );
  }
  
  if (loading || !profileData) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }
  
  // Only allow editing if viewing your own profile
  const isOwnProfile = user?.id === profileData.id;
  
  return (
    <MobileLayout>
      <div className="flex flex-col">
        <ProfileHeader 
          profileData={profileData} 
          onEditProfile={() => setIsEditorOpen(true)}
        />
        
        <ProfileInfo profileData={profileData} />
        
        <ProfileTabs 
          profileData={profileData}
          userPosts={userPosts}
          onTabChange={handleTabChange}
        />
      </div>
      
      {isOwnProfile && (
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <ProfileEditor onClose={() => setIsEditorOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </MobileLayout>
  );
};

export default Profile;
