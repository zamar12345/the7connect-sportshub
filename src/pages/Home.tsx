
import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import PostCard from "@/components/PostCard";
import StoriesRow from "@/components/StoriesRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePostsQuery, useFollowingPostsQuery } from "@/hooks/usePostsQuery";
import { useAuth } from "@/context/AuthProvider";

const Home = () => {
  const [activeTab, setActiveTab] = useState("forYou");
  const { user } = useAuth();
  
  // Fetch "For You" posts
  const { 
    data: forYouPosts = [], 
    isLoading: isLoadingForYou 
  } = usePostsQuery();
  
  // Fetch "Following" posts
  const {
    data: followingPosts = [],
    isLoading: isLoadingFollowing,
    refetch: refetchFollowingPosts
  } = useFollowingPostsQuery({
    enabled: !!user // Only fetch if user is logged in
  });
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Fetch following posts if changing to that tab and we have a user
    if (value === "following" && user) {
      refetchFollowingPosts();
    }
  };
  
  return (
    <MobileLayout>
      <div className="flex flex-col">
        <StoriesRow />
        
        <div className="px-1">
          <Tabs 
            defaultValue="forYou" 
            onValueChange={handleTabChange} 
            className="w-full"
          >
            <div className="border-b border-border sticky top-14 bg-background/80 backdrop-blur-md z-10">
              <TabsList className="w-full bg-transparent h-12 p-0">
                <TabsTrigger 
                  value="forYou" 
                  className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                >
                  For You
                </TabsTrigger>
                <TabsTrigger 
                  value="following" 
                  className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                >
                  Following
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="forYou" className="pt-1 mt-0">
              {isLoadingForYou ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : forYouPosts.length > 0 ? (
                <div className="divide-y divide-border">
                  {forYouPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-lg font-medium mb-2">No posts yet</p>
                  <p className="text-muted-foreground text-center">
                    {user ? "Be the first to create a post!" : "Sign in to see and create posts!"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="following" className="pt-1 mt-0">
              {!user ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-lg font-medium mb-2">Sign in to see posts from people you follow</p>
                  <p className="text-muted-foreground text-center">
                    Create an account or sign in to view your personalized feed.
                  </p>
                </div>
              ) : isLoadingFollowing ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : followingPosts.length > 0 ? (
                <div className="divide-y divide-border">
                  {followingPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-lg font-medium mb-2">No posts yet</p>
                  <p className="text-muted-foreground text-center mb-4">
                    Follow some users to see their posts here!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Home;
