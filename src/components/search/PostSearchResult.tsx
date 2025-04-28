
import React from "react";
import { MessageSquare } from "lucide-react";
import { PostSearchResult } from "@/services/search";

interface PostSearchResultProps {
  result: PostSearchResult;
  onClick: (result: PostSearchResult) => void;
}

const PostSearchResult = ({ result, onClick }: PostSearchResultProps) => {
  return (
    <div 
      className="flex items-start p-3 hover:bg-muted cursor-pointer"
      onClick={() => onClick(result)}
    >
      <MessageSquare size={16} className="mt-1 mr-3 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate mb-1">
          <span className="font-semibold text-primary">@{result.username}</span>
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {result.content}
        </p>
      </div>
    </div>
  );
};

export default PostSearchResult;
