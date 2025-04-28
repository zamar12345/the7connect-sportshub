
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserSearchResult } from "@/services/search";
import { User, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import FollowButton from "@/components/FollowButton";

interface UserSearchResultsProps {
  users: UserSearchResult[];
  loading: boolean;
  searchQuery: string;
}

const UserSearchResults = ({ users, loading, searchQuery }: UserSearchResultsProps) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
  
  if (users.length === 0) {
    if (searchQuery.length >= 2) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching "{searchQuery}"
        </div>
      );
    }
    
    return (
      <div className="text-center py-8 text-muted-foreground">
        Enter a search term to find users
      </div>
    );
  }
  
  return (
    <div className="space-y-2 divide-y divide-border">
      {users.map((user) => (
        <div 
          key={user.id} 
          className="py-3 flex items-center justify-between"
          onClick={() => navigate(`/profile/${user.username}`)}
        >
          <div className="flex items-center space-x-3 cursor-pointer">
            <Avatar>
              <AvatarImage src={user.avatar_url} alt={user.username} />
              <AvatarFallback>
                <User size={18} />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.full_name || user.username}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-1">{user.bio}</p>
              )}
            </div>
          </div>
          <FollowButton userId={user.id} />
        </div>
      ))}
    </div>
  );
};

export default UserSearchResults;
