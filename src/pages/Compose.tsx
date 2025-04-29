
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Image, Video, MapPin, Smile, ArrowLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadMedia, VALID_IMAGE_TYPES, VALID_VIDEO_TYPES } from "@/services/mediaService";
import { createPost } from "@/services/postService";
import { MediaUploadPreview } from "@/components/MediaUploadPreview";

const Compose = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
  
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    // Validate file type
    if (type === 'image' && !VALID_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP, GIF)");
      return;
    }
    
    if (type === 'video' && !VALID_VIDEO_TYPES.includes(file.type)) {
      toast.error("Please select a valid video file (MP4, WEBM, MOV)");
      return;
    }
    
    // Set the selected file for preview
    setMediaFile(file);
    setMediaUrl(null);
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };
  
  // Remove the uploaded media
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaUrl(null);
    setUploadProgress(0);
  };
  
  const handlePost = async () => {
    if (content.trim() === "" && !mediaFile) {
      toast.error("Please add some content or media to your post");
      return;
    }
    
    if (!user) {
      toast.error("You must be signed in to post");
      return;
    }
    
    setIsPosting(true);
    
    try {
      let finalImageUrl: string | undefined;
      let finalVideoUrl: string | undefined;
      
      // Upload media if present
      if (mediaFile) {
        const isImage = VALID_IMAGE_TYPES.includes(mediaFile.type);
        const isVideo = VALID_VIDEO_TYPES.includes(mediaFile.type);
        
        const uploadedUrl = await uploadMedia({
          file: mediaFile,
          userId: user.id,
          onProgress: (progress) => setUploadProgress(progress),
        });
        
        if (!uploadedUrl) {
          throw new Error("Failed to upload media");
        }
        
        if (isImage) {
          finalImageUrl = uploadedUrl;
        } else if (isVideo) {
          finalVideoUrl = uploadedUrl;
        }
      }
      
      // Extract hashtags
      const hashtags = extractHashtags(content);
      
      // Create the post
      const post = await createPost(content, finalImageUrl, finalVideoUrl);
      
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
          disabled={content.trim() === "" && !mediaFile || content.length > charLimit || isPosting}
          className="bg-sport-green hover:bg-sport-green/90 text-white"
        >
          {isPosting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            "Post"
          )}
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
          
          {/* Media Preview */}
          {(mediaFile || mediaUrl) && (
            <MediaUploadPreview
              file={mediaFile}
              url={mediaUrl}
              onRemove={handleRemoveMedia}
              uploadProgress={uploadProgress}
            />
          )}
          
          <div className="flex items-center justify-between border-t border-border mt-4 pt-4">
            <div className="flex space-x-4">
              {/* Image Upload */}
              <div className="relative">
                <input 
                  type="file"
                  id="image-upload"
                  className="sr-only"
                  accept={VALID_IMAGE_TYPES.join(',')}
                  onChange={(e) => handleFileUpload(e, 'image')}
                  disabled={isPosting || !!mediaFile}
                />
                <label htmlFor="image-upload">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-sport-blue cursor-pointer"
                    disabled={isPosting || !!mediaFile}
                  >
                    <Image size={20} />
                  </Button>
                </label>
              </div>
              
              {/* Video Upload */}
              <div className="relative">
                <input 
                  type="file"
                  id="video-upload"
                  className="sr-only"
                  accept={VALID_VIDEO_TYPES.join(',')}
                  onChange={(e) => handleFileUpload(e, 'video')}
                  disabled={isPosting || !!mediaFile}
                />
                <label htmlFor="video-upload">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-sport-blue cursor-pointer"
                    disabled={isPosting || !!mediaFile}
                  >
                    <Video size={20} />
                  </Button>
                </label>
              </div>
              
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
