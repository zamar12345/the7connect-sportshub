import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useUserProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

type ProfileData = {
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  sport?: string;
  disciplines?: string[];
};

const ProfileEditor = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    username: "",
    full_name: "",
    bio: "",
    avatar_url: "",
    sport: "",
    disciplines: []
  });
  const [newDiscipline, setNewDiscipline] = useState("");
  
  const { data: profile, isLoading } = useUserProfile(user?.id);
  const { uploadAvatar, isUploading, updateProfile, isUpdating } = useUpdateProfile();

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
        sport: profile.sport || "",
        disciplines: profile.disciplines || []
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    uploadAvatar({ file, userId: user.id }, {
      onSuccess: (publicUrl) => {
        setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      }
    });
  };

  const addDiscipline = () => {
    if (!newDiscipline.trim()) return;
    
    if (!formData.disciplines) {
      setFormData(prev => ({ ...prev, disciplines: [newDiscipline] }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        disciplines: [...prev.disciplines!, newDiscipline]
      }));
    }
    
    setNewDiscipline("");
  };

  const removeDiscipline = (index: number) => {
    if (!formData.disciplines) return;
    
    const updatedDisciplines = [...formData.disciplines];
    updatedDisciplines.splice(index, 1);
    setFormData(prev => ({ ...prev, disciplines: updatedDisciplines }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    updateProfile({ userId: user.id, profile: formData }, {
      onSuccess: () => onClose()
    });
  };

  if (isLoading && !formData.username) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-background">
              {formData.avatar_url ? (
                <AvatarImage src={formData.avatar_url} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  <User className="w-12 h-12 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="absolute -bottom-2 -right-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="bg-primary text-white p-2 rounded-full hover:bg-primary/90">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </Label>
            </div>
          </div>
          {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Your full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="@username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sport">Primary Sport</Label>
          <Input
            id="sport"
            name="sport"
            value={formData.sport || ""}
            onChange={handleChange}
            placeholder="e.g., Running, Basketball, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label>Disciplines</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.disciplines?.map((discipline, index) => (
              <div key={index} className="bg-secondary text-secondary-foreground text-xs py-1 px-2 rounded-full flex items-center">
                <span>{discipline}</span>
                <button 
                  type="button" 
                  onClick={() => removeDiscipline(index)}
                  className="ml-1 text-secondary-foreground/70"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <Input
              value={newDiscipline}
              onChange={(e) => setNewDiscipline(e.target.value)}
              placeholder="Add a discipline"
              className="mr-2"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={addDiscipline}
            >
              Add
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;
