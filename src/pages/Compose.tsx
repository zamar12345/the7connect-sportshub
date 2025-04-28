
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Image, Video, MapPin, Smile, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Compose = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const charLimit = 280;
  const charsRemaining = charLimit - content.length;

  // Extract hashtags from content
  const extractHashtags = (text: string) => {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    
    while ((match = hashtagRegex.exec(text)) !== null) {
      hashtags.push(match[1]);
    }
    
    return hashtags;
  };
  
  const handlePost = async () => {
    if (content.trim() === "" || !user) return;
    
    setIsPosting(true);
    
    const hashtags = extractHashtags(content);
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content,
          user_id: user.id,
          hashtags
        })
        .select();
        
      if (error) throw error;
      
      toast.success("Post created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(`Error creating post: ${error.message}`);
    } finally {
      setIsPosting(false);
    }
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
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>{user?.user_metadata?.full_name?.[0] || user?.email?.[0]}</AvatarFallback>
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
