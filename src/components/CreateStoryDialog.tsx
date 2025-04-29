
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth/AuthProvider";
import { MAX_IMAGE_SIZE, VALID_IMAGE_TYPES } from "@/services/mediaService";

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateStoryDialog = ({ open, onOpenChange, onSuccess }: CreateStoryDialogProps) => {
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    // Validate file type
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      toast.error(`Invalid file type. Please upload ${VALID_IMAGE_TYPES.join(", ")}`);
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`File too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    // Set file and create preview
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !imageFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      setUploading(true);

      // Upload the image
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/stories/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("stories")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("stories")
        .getPublicUrl(fileName);

      // Create story record in database
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          image_url: publicUrlData.publicUrl,
          caption: caption || null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        } as any);

      if (storyError) throw storyError;

      toast.success("Story created successfully!");
      setImageFile(null);
      setImagePreview(null);
      setCaption("");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error creating story:", error);
      toast.error(error.message || "Failed to create story");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new story</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!imagePreview ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
              <Label htmlFor="story-image" className="cursor-pointer text-center">
                <div className="flex flex-col items-center gap-2">
                  <ImagePlus className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload an image</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, GIF up to 10MB</span>
                </div>
                <Input
                  id="story-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full object-cover rounded-md aspect-[9/16] max-h-[300px]" 
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Change
              </Button>
            </div>
          )}

          {imagePreview && (
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                placeholder="Add a caption to your story..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!imageFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Create Story"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryDialog;
