import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";
import DonateButton from "@/components/DonateButton";
import { ProfileData } from "@/types/profile";
import { useAuth } from "@/context/AuthProvider";
import FollowButton from "@/components/FollowButton";
import { useNavigate } from "react-router-dom";
import StartMessageButton from "@/components/messages/StartMessageButton";

interface ProfileHeaderProps {
  profileData: ProfileData;
  onEditProfile: () => void;
}

const ProfileHeader = ({ profileData, onEditProfile }: ProfileHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCurrentUser = user?.id === profileData.id;
  const isOwnProfile = user?.id === profileData.id;
  
  const handleEditProfile = () => {
    navigate('/profile/edit');
  };
  
  return (
    <div className="relative">
      <div className="h-32 bg-gradient-to-r from-sport-blue via-sport-green to-sport-orange"></div>
      
      <div className="absolute bottom-0 left-4 transform translate-y-1/2 border-4 border-background rounded-full">
        <Avatar className="w-20 h-20">
          {profileData.avatar_url ? (
            <AvatarImage src={profileData.avatar_url} alt={profileData.full_name} />
          ) : (
            <AvatarFallback className="text-2xl bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="absolute bottom-0 right-4 transform translate-y-1/2 flex space-x-2">
        {isCurrentUser ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full"
            onClick={handleEditProfile}
          >
            <Settings size={16} className="mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            {!isOwnProfile && (
              <>
                <FollowButton profileId={profileData.id} />
                <StartMessageButton userId={profileData.id} username={profileData.username} />
              </>
            )}
          </div>
        )}
        <DonateButton 
          recipientId={profileData.id} 
          recipientName={profileData.full_name || profileData.username} 
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
