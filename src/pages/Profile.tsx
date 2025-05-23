
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { User } from "@/types/supabase";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { ProfileData } from "@/types/profile";
import { Skeleton } from "@/components/ui/skeleton";
import MobileLayout from "@/components/layout/MobileLayout";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If no ID is provided, use the current user's ID
        const profileId = id || user?.id;
        
        if (!profileId) {
          setError("No profile ID provided");
          setLoading(false);
          return;
        }
        
        let query;
        
        // Check if ID is a UUID (either way)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
        
        if (isUUID) {
          // Query by ID if it's a UUID
          query = supabase
            .from("users")
            .select("*")
            .eq("id", profileId);
        } else {
          // Query by username if it's not a UUID
          query = supabase
            .from("users")
            .select("*")
            .eq("username", profileId);
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        if (!data) {
          setError("Profile not found");
          setLoading(false);
          return;
        }
        
        setProfile(data);
        
        // Now fetch user's posts
        if (data.id) {
          const { data: postsData, error: postsError } = await supabase
            .from("posts")
            .select("*, user:users(*)")
            .eq("user_id", data.id)
            .order("created_at", { ascending: false });
            
          if (postsError) {
            console.error("Error fetching posts:", postsError);
          } else {
            setUserPosts(postsData || []);
          }
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, user?.id]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Convert User to ProfileData for components
  const profileData: ProfileData | null = profile ? {
    id: profile.id,
    username: profile.username,
    full_name: profile.full_name || "",
    avatar_url: profile.avatar_url || "",
    banner_url: profile.banner_url || "",
    bio: profile.bio || "",
    sport: profile.sport || undefined,
    disciplines: profile.disciplines || [],
    followers: profile.followers || 0,
    following: profile.following || 0,
    // Add other properties as needed
  } : null;

  if (loading) {
    return (
      <MobileLayout>
        <div className="h-32 bg-gradient-to-r from-muted via-muted to-muted animate-pulse"></div>
        <div className="p-4 mt-10">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-20 w-full mb-6" />
          <div className="space-y-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout>
        <div className="container max-w-lg mx-auto py-10 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  if (!profile || !profileData) {
    return (
      <MobileLayout>
        <div className="container max-w-lg mx-auto py-10 text-center">
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">The requested profile could not be found.</p>
          <Button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <ProfileHeader 
        profileData={profileData} 
        onEditProfile={() => {}}  // This is now handled within the ProfileHeader component
      />
      <ProfileInfo profileData={profileData} />
      <ProfileTabs 
        profileData={profileData} 
        userPosts={userPosts} 
        onTabChange={handleTabChange}
      />
    </MobileLayout>
  );
};

export default Profile;
