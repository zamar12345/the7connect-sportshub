
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import MobileLayout from "@/components/layout/MobileLayout";
import { mockPosts } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { CreditCard, Award, Settings, Heart, Trophy, Medal, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import DonateButton from "@/components/DonateButton";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileEditor from "@/components/ProfileEditor";

type ProfileData = {
  id: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  sport?: string;
  disciplines?: string[];
  followers?: number;
  following?: number;
  achievements?: {
    title: string;
    year: string;
    icon?: "trophy" | "medal" | "award";
  }[];
  stats?: {
    label: string;
    value: string | number;
  }[];
};

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
            achievements: data.achievements || [],
            stats: data.stats || []
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
  
  const getAchievementIcon = (icon?: "trophy" | "medal" | "award") => {
    switch (icon) {
      case "trophy":
        return <Trophy size={16} className="text-sport-orange" />;
      case "medal":
        return <Medal size={16} className="text-sport-green" />;
      case "award":
      default:
        return <Award size={16} className="text-sport-blue" />;
    }
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
        {/* Profile Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-sport-blue via-sport-green to-sport-orange"></div>
          
          <div className="absolute bottom-0 left-4 transform translate-y-1/2 border-4 border-background rounded-full">
            <Avatar className="w-20 h-20">
              {profileData.avatar_url ? (
                <AvatarImage src={profileData.avatar_url} alt={profileData.full_name} />
              ) : (
                <AvatarFallback className="text-2xl bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full"
              onClick={() => setIsEditorOpen(true)}
            >
              <Settings size={16} className="mr-1" />
              Edit
            </Button>
            <Button size="sm" className="bg-sport-orange hover:bg-sport-orange/90 rounded-full">
              <CreditCard size={16} className="mr-1" />
              Donate
            </Button>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="mt-12 p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold mr-1">{profileData.full_name}</h1>
          </div>
          <p className="text-muted-foreground">@{profileData.username}</p>
          
          <div className="flex flex-wrap gap-2 mt-1">
            {profileData.sport && (
              <span className="bg-primary/10 text-primary text-xs py-1 px-2 rounded-full">
                {profileData.sport}
              </span>
            )}
            {profileData.disciplines?.map((discipline, index) => (
              <span key={index} className="bg-sport-blue/10 text-sport-blue text-xs py-1 px-2 rounded-full">
                {discipline}
              </span>
            ))}
          </div>
          
          {profileData.bio && <p className="mt-2 text-foreground">{profileData.bio}</p>}
          
          <div className="flex space-x-4 mt-3">
            <div>
              <span className="font-semibold">{profileData.following || 0}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold">{profileData.followers || 0}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </div>
          </div>
          
          {profileData.achievements && profileData.achievements.length > 0 && (
            <Card className="mt-4 p-4 bg-card/50">
              <h3 className="text-sm font-semibold mb-3">Achievements</h3>
              <div className="space-y-2">
                {profileData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {getAchievementIcon(achievement.icon)}
                    <span className="text-sm">{achievement.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{achievement.year}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {profileData.stats && profileData.stats.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {profileData.stats.map((stat, index) => (
                <div key={index} className="bg-card/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Profile Tabs */}
        <div className="border-t border-border">
          <Tabs defaultValue="posts" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-transparent h-12">
              <TabsTrigger 
                value="posts" 
                className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
              >
                Media
              </TabsTrigger>
              <TabsTrigger 
                value="likes" 
                className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
              >
                Likes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              <div className="divide-y divide-border">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {userPosts.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No posts yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="media">
              <div className="p-4">
                <div className="grid grid-cols-3 gap-1">
                  {userPosts
                    .filter((post) => post.images && post.images.length > 0)
                    .map((post) => (
                      <div key={post.id} className="aspect-square overflow-hidden">
                        <img 
                          src={post.images![0]} 
                          alt="Post media" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                </div>
                
                {userPosts.filter((post) => post.images && post.images.length > 0).length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No media yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="likes">
              <div className="p-4 flex items-center justify-center flex-col">
                <Heart size={40} className="text-muted mb-2" />
                <p className="text-muted-foreground">Posts you've liked will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
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
