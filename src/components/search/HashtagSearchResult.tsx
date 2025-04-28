
import React from "react";
import { Hash } from "lucide-react";
import type { HashtagSearchResult as HashtagSearchResultType } from "@/services/search";

interface HashtagSearchResultProps {
  result: HashtagSearchResultType;
  onClick: (result: HashtagSearchResultType) => void;
}

const HashtagSearchResult = ({ result, onClick }: HashtagSearchResultProps) => {
  return (
    <div 
      className="flex items-center p-3 hover:bg-muted cursor-pointer"
      onClick={() => onClick(result)}
    >
      <Hash size={18} className="mr-3 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">
          #{result.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {result.post_count} {result.post_count === 1 ? 'post' : 'posts'}
        </p>
      </div>
    </div>
  );
};

export default HashtagSearchResult;
