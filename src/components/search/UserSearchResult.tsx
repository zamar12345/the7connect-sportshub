
import React from "react";
import { User } from "lucide-react";
import type { UserSearchResult as UserSearchResultType } from "@/services/search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserSearchResultProps {
  result: UserSearchResultType;
  onClick: (result: UserSearchResultType) => void;
}

const UserSearchResult = ({ result, onClick }: UserSearchResultProps) => {
  return (
    <div 
      className="flex items-center p-3 hover:bg-muted cursor-pointer"
      onClick={() => onClick(result)}
    >
      <Avatar className="h-9 w-9 mr-3">
        <AvatarImage src={result.avatar_url || ""} alt={result.username} />
        <AvatarFallback>
          <User size={18} />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">
          {result.full_name || result.username}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          @{result.username}
        </p>
      </div>
      <User size={16} className="text-muted-foreground" />
    </div>
  );
};

export default UserSearchResult;
