
import { HashtagSearchResult } from "@/services/search";
import { Hash, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HashtagSearchResultsProps {
  hashtags: HashtagSearchResult[];
  loading: boolean;
  searchQuery: string;
}

const HashtagSearchResults = ({ hashtags, loading, searchQuery }: HashtagSearchResultsProps) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
  
  if (hashtags.length === 0) {
    if (searchQuery.length >= 2) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No topics found matching "{searchQuery}"
        </div>
      );
    }
    
    return (
      <div className="text-center py-8 text-muted-foreground">
        Enter a search term to find topics
      </div>
    );
  }
  
  return (
    <div className="space-y-2 divide-y divide-border">
      {hashtags.map((hashtag) => (
        <div 
          key={hashtag.id} 
          className="py-3 flex items-center cursor-pointer"
          onClick={() => navigate(`/explore/tag/${hashtag.name}`)}
        >
          <div className="mr-3 bg-primary/10 p-2 rounded-full">
            <Hash size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium">#{hashtag.name}</p>
            <p className="text-sm text-muted-foreground">
              {hashtag.post_count} {hashtag.post_count === 1 ? 'post' : 'posts'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HashtagSearchResults;
