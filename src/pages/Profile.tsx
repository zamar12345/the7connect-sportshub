
import { useState, useEffect } from "react";
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

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const userPosts = mockPosts.filter((post) => post.user.id === profileData?.id);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
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
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast.error(`Error loading profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, isEditorOpen]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  if (loading || !profileData) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }
  
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
      
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ProfileEditor onClose={() => setIsEditorOpen(false)} />
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Profile;
