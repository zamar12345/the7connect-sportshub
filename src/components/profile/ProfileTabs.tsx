
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { CreditCard, Heart } from "lucide-react";
import { ProfileData } from "@/types/profile";
import ProfileDonationsTab from "./ProfileDonationsTab";

interface ProfileTabsProps {
  profileData: ProfileData;
  userPosts: any[];
  onTabChange: (tab: string) => void;
}

const ProfileTabs = ({ profileData, userPosts, onTabChange }: ProfileTabsProps) => {
  return (
    <div className="border-t border-border">
      <Tabs defaultValue="posts" onValueChange={onTabChange}>
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
            value="donations" 
            className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
          >
            Donations
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
        
        <TabsContent value="donations">
          <ProfileDonationsTab profileId={profileData.id} />
        </TabsContent>
        
        <TabsContent value="likes">
          <div className="p-4 flex items-center justify-center flex-col">
            <Heart size={40} className="text-muted mb-2" />
            <p className="text-muted-foreground">Posts you've liked will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
