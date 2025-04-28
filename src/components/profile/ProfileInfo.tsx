
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { ProfileData, Achievement } from "@/types/profile";

interface ProfileInfoProps {
  profileData: ProfileData;
}

const ProfileInfo = ({ profileData }: ProfileInfoProps) => {
  const getAchievementIcon = (icon?: "trophy" | "medal" | "award") => {
    switch (icon) {
      case "trophy":
        return <Trophy size={16} className="text-sport-orange" />;
      case "medal":
        return <Medal size={16} className="text-sport-green" />;
      case "award":
      default:
        return <Award size={16} className="text-sport-blue" />;
    }
  };

  return (
    <div className="mt-12 p-4">
      <div className="flex items-center">
        <h1 className="text-xl font-bold mr-1">{profileData.full_name}</h1>
      </div>
      <p className="text-muted-foreground">@{profileData.username}</p>
      
      <div className="flex flex-wrap gap-2 mt-1">
        {profileData.sport && (
          <span className="bg-primary/10 text-primary text-xs py-1 px-2 rounded-full">
            {profileData.sport}
          </span>
        )}
        {profileData.disciplines?.map((discipline, index) => (
          <span key={index} className="bg-sport-blue/10 text-sport-blue text-xs py-1 px-2 rounded-full">
            {discipline}
          </span>
        ))}
      </div>
      
      {profileData.bio && <p className="mt-2 text-foreground">{profileData.bio}</p>}
      
      <div className="flex space-x-4 mt-3">
        <div>
          <span className="font-semibold">{profileData.following || 0}</span>
          <span className="text-muted-foreground ml-1">Following</span>
        </div>
        <div>
          <span className="font-semibold">{profileData.followers || 0}</span>
          <span className="text-muted-foreground ml-1">Followers</span>
        </div>
      </div>
      
      {profileData.achievements && profileData.achievements.length > 0 && (
        <Card className="mt-4 p-4 bg-card/50">
          <h3 className="text-sm font-semibold mb-3">Achievements</h3>
          <div className="space-y-2">
            {profileData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-2">
                {getAchievementIcon(achievement.icon)}
                <span className="text-sm">{achievement.title}</span>
                <span className="text-xs text-muted-foreground ml-auto">{achievement.year}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {profileData.stats && profileData.stats.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {profileData.stats.map((stat, index) => (
            <div key={index} className="bg-card/50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
