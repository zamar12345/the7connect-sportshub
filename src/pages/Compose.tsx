
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Image, Video, MapPin, Smile, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/data/mockData";
import { Textarea } from "@/components/ui/textarea";

const Compose = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const charLimit = 280;
  const charsRemaining = charLimit - content.length;
  
  const handlePost = async () => {
    if (content.trim() === "") return;
    
    setIsPosting(true);
    
    // Simulate post creation
    setTimeout(() => {
      setIsPosting(false);
      navigate("/");
      
      // This would be replaced with actual toast from the UI
      console.log("Post created successfully!");
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border p-3 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        
        <Button
          size="sm"
          onClick={handlePost}
          disabled={content.trim() === "" || content.length > charLimit || isPosting}
          className="bg-sport-green hover:bg-sport-green/90 text-white"
        >
          {isPosting ? "Posting..." : "Post"}
        </Button>
      </header>
      
      <div className="flex p-4 pb-16 flex-1">
        <Avatar className="h-10 w-10 mt-1">
          <AvatarImage src={currentUser.avatar} />
          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="ml-3 flex-1">
          <Textarea
            placeholder="What's happening in your sports world?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] border-none shadow-none resize-none text-lg p-0 focus-visible:ring-0"
            autoFocus
          />
          
          <div className="flex items-center justify-between border-t border-border mt-4 pt-4">
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-sport-blue">
                <Image size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-sport-blue">
                <Video size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-sport-blue">
                <MapPin size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-sport-blue">
                <Smile size={20} />
              </Button>
            </div>
            
            <div className={`text-sm ${charsRemaining < 20 ? "text-sport-orange" : "text-muted-foreground"}`}>
              {charsRemaining}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compose;
