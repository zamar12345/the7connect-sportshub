
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Story, markStoryViewed } from "@/services/storyService";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StoryViewer = ({ story, onClose, onNext, onPrevious }: StoryViewerProps) => {
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  
  // Handle story timing (auto-progress)
  useEffect(() => {
    const storyDuration = 5000; // 5 seconds per story
    const interval = 100; // Update progress every 100ms
    const steps = storyDuration / interval;
    let currentStep = 0;
    
    // Mark story as viewed
    markStoryViewed(story.id);
    
    // Progress bar timer
    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        onNext(); // Go to next story when time is up
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [story.id, onNext]);
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 h-[90vh] max-h-[600px] flex flex-col overflow-hidden">
        {/* Story header */}
        <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent absolute top-0 left-0 right-0 z-10">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
            <div 
              className="h-full bg-white" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={story.user?.avatar_url} />
              <AvatarFallback>{story.user?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="text-sm font-medium">{story.user?.username || 'User'}</p>
              <p className="text-xs opacity-80">
                {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-white">
            <X size={20} />
          </Button>
        </div>
        
        {/* Story image */}
        <div className="flex-1 bg-black flex items-center justify-center w-full h-full">
          <img 
            src={story.image_url} 
            alt="Story" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Caption */}
        {story.caption && (
          <div className="p-4 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white">{story.caption}</p>
          </div>
        )}
        
        {/* Navigation controls */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
        >
          <ChevronLeft size={20} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <ChevronRight size={20} />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer;
