import { useEffect, useRef, useState } from "react";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth/AuthProvider";
import CreateStoryDialog from "./CreateStoryDialog";
import { fetchStories, Story } from "@/services/storyService";
import StoryViewer from "./StoryViewer";

const StoriesRow = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      try {
        const storiesData = await fetchStories();
        setStories(storiesData);
      } catch (error) {
        console.error("Error loading stories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleStoryCreated = async () => {
    try {
      const storiesData = await fetchStories();
      setStories(storiesData);
    } catch (error) {
      console.error("Error refreshing stories:", error);
    }
  };

  const handleViewStory = (story: Story) => {
    setActiveStory(story);
    setShowStoryViewer(true);
  };

  return (
    <div className="relative pb-2 mb-1">
      <div className="flex items-center mb-2 px-4">
        <h3 className="text-md font-semibold">Stories</h3>
      </div>
      
      <div className="relative">
        <div 
          ref={scrollRef} 
          className="flex gap-3 overflow-x-auto px-4 scrollbar-hidden pb-1"
        >
          {/* Create new story */}
          {user && (
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-1 relative border-2 border-dashed border-muted-foreground">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="w-full h-full rounded-full bg-muted/50"
                  onClick={() => setCreateStoryOpen(true)}
                >
                  <Plus size={20} />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground mt-1">New</span>
            </div>
          )}
          
          {/* Stories */}
          {loading ? (
            <div className="flex items-center justify-center py-2 px-10">
              <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-primary rounded-full"></div>
            </div>
          ) : stories.length > 0 ? (
            stories.map((story) => (
              <div 
                key={story.id} 
                className="flex-shrink-0 flex flex-col items-center cursor-pointer"
                onClick={() => handleViewStory(story)}
              >
                <div className={`w-16 h-16 rounded-full p-[2px] ${story.viewed ? 'bg-muted' : 'sports-gradient'}`}>
                  <div className="rounded-full bg-background p-[2px] w-full h-full">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={story.user?.avatar_url} alt={story.user?.username || ''} />
                      <AvatarFallback>{story.user?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-1 truncate w-16 text-center">
                  {story.user?.username || 'User'}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-2 px-10">
              <span className="text-xs text-muted-foreground">No stories yet</span>
            </div>
          )}
        </div>
        
        <Button 
          size="icon" 
          variant="secondary" 
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-80 rounded-full w-8 h-8" 
          onClick={scrollLeft}
        >
          <ChevronLeft size={18} />
        </Button>
        
        <Button 
          size="icon" 
          variant="secondary" 
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-80 rounded-full w-8 h-8" 
          onClick={scrollRight}
        >
          <ChevronRight size={18} />
        </Button>
      </div>
      
      {/* Create Story Dialog */}
      <CreateStoryDialog 
        open={createStoryOpen} 
        onOpenChange={setCreateStoryOpen} 
        onSuccess={handleStoryCreated}
      />

      {/* Story Viewer (will be implemented in StoryViewer.tsx) */}
      {showStoryViewer && activeStory && (
        <StoryViewer 
          story={activeStory}
          onClose={() => setShowStoryViewer(false)}
          onNext={() => {
            const currentIndex = stories.findIndex(s => s.id === activeStory.id);
            if (currentIndex < stories.length - 1) {
              setActiveStory(stories[currentIndex + 1]);
            } else {
              setShowStoryViewer(false);
            }
          }}
          onPrevious={() => {
            const currentIndex = stories.findIndex(s => s.id === activeStory.id);
            if (currentIndex > 0) {
              setActiveStory(stories[currentIndex - 1]);
            }
          }}
        />
      )}
    </div>
  );
};

export default StoriesRow;
