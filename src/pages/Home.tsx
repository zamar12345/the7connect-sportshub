
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import PostCard from "@/components/PostCard";
import StoriesRow from "@/components/StoriesRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPosts } from "@/services/postService";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

const Home = () => {
  const [activeTab, setActiveTab] = useState("forYou");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);
        const postsData = await fetchPosts();
        setPosts(postsData);
      } catch (error: any) {
        console.error("Error fetching posts:", error);
        toast.error(`Error loading posts: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    getPosts();
  }, []);
  
  return (
    <MobileLayout>
      <div className="flex flex-col">
        <StoriesRow />
        
        <div className="px-1">
          <Tabs 
            defaultValue="forYou" 
            onValueChange={setActiveTab} 
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
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="divide-y divide-border">
                  {posts.map((post) => (
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
              <div className="flex flex-col items-center justify-center p-8">
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p className="text-muted-foreground text-center">
                  The Following feed will be available soon.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Home;
