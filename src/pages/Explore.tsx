
import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTrendingTopics, mockUsers, mockPosts } from "@/data/mockData";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <MobileLayout>
      <div className="p-4">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search athletes, topics, or keywords" 
            className="pl-10 bg-muted" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
            <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
            <TabsTrigger value="sports" className="flex-1">Sports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="space-y-4">
            <div className="bg-card rounded-lg p-4">
              <h3 className="font-semibold mb-3">Trending Topics</h3>
              {mockTrendingTopics.map((topic) => (
                <div key={topic.id} className="py-2 border-b border-border last:border-none">
                  <p className="font-medium text-primary">{topic.name}</p>
                  <p className="text-sm text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
                </div>
              ))}
            </div>
            
            <div className="bg-card rounded-lg p-4">
              <h3 className="font-semibold mb-3">Trending Posts</h3>
              <div className="space-y-4">
                {mockPosts.slice(0, 3).map((post) => {
                  // Ensure post has created_at property
                  const postWithCreatedAt = {
                    ...post,
                    created_at: post.created_at || new Date().toISOString()
                  };
                  return <PostCard key={post.id} post={postWithCreatedAt} />;
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="discover" className="space-y-4">
            <div className="bg-card rounded-lg p-4">
              <h3 className="font-semibold mb-3">Athletes to Follow</h3>
              <div className="space-y-3">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{user.name}</p>
                          {user.isVerified && (
                            <span className="text-primary ml-1">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.sport}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sports" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {["Basketball", "Football", "Tennis", "Swimming", "Soccer", "Golf", "Baseball", "Athletics"].map((sport) => (
                <div 
                  key={sport} 
                  className="p-4 rounded-lg bg-gradient-to-br from-sport-blue/80 to-sport-green/80 aspect-[4/3] flex items-center justify-center"
                >
                  <span className="text-white font-bold text-lg">{sport}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Explore;
