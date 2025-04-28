
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useUpdateOnboardingStep } from "@/hooks/useOnboarding";
import { useAuth } from "@/context/AuthProvider";
import { useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { updateProfile, isUpdating, uploadAvatar, isUploading } = useUpdateProfile();
  const { mutate: updateStep } = useUpdateOnboardingStep();
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    avatar_url: '',
  });

  // Pre-populate form with existing data if available
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    
    updateProfile({ userId: user.id, profile: formData }, {
      onSuccess: () => {
        updateStep({ step: 'profile' }, {
          onSuccess: () => navigate('/onboarding/interests')
        });
      }
    });
  };

  return (
    <OnboardingLayout 
      title="Set Up Your Profile"
      subtitle="Tell us a bit about yourself"
      currentStep="profile"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Username <span className="text-destructive">*</span></Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="@username"
              required
            />
            <p className="text-xs text-muted-foreground">This will be your unique identifier on The7Connect</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Share a brief introduction about yourself (optional)</p>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={isUpdating || isUploading}
          >
            {isUpdating ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  );
};

export default Profile;
