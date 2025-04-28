
import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import PostCard from "@/components/PostCard";
import StoriesRow from "@/components/StoriesRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPosts } from "@/data/mockData";

const Home = () => {
  const [activeTab, setActiveTab] = useState("forYou");
  const [posts, setPosts] = useState(mockPosts);
  
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
              <div className="divide-y divide-border">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="following" className="pt-1 mt-0">
              <div className="divide-y divide-border">
                {posts.filter((_, i) => i % 2 === 0).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Home;
