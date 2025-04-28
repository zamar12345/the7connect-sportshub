
import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { mockPosts, currentUser } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { CreditCard, Award, Settings, Heart } from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const user = currentUser;
  const userPosts = mockPosts.filter((post) => post.user.id === user.id);
  
  return (
    <MobileLayout>
      <div className="flex flex-col">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-sport-blue via-sport-green to-sport-orange"></div>
          
          {/* Profile Picture */}
          <div className="absolute bottom-0 left-4 transform translate-y-1/2 border-4 border-background rounded-full">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          
          {/* Actions */}
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 flex space-x-2">
            <Button variant="outline" size="sm" className="rounded-full">
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
            <h1 className="text-xl font-bold mr-1">{user.name}</h1>
            {user.isVerified && (
              <span className="text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </div>
          <p className="text-muted-foreground">@{user.username}</p>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className="bg-primary/10 text-primary text-xs py-1 px-2 rounded-full">
              {user.sport}
            </span>
            <span className="flex items-center text-xs text-muted-foreground">
              <Award size={14} className="mr-1 text-sport-orange" />
              Athlete
            </span>
          </div>
          
          <p className="mt-2 text-foreground">{user.bio}</p>
          
          <div className="flex space-x-4 mt-3">
            <div>
              <span className="font-semibold">{user.following}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold">{user.followers}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </div>
          </div>
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
    </MobileLayout>
  );
};

export default Profile;
