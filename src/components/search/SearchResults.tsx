
import React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  SearchResult, 
  UserSearchResult, 
  PostSearchResult, 
  HashtagSearchResult 
} from "@/services/search";
import { Button } from "@/components/ui/button";
import UserSearchResult from "./UserSearchResult";
import PostSearchResult from "./PostSearchResult";
import HashtagSearchResult from "./HashtagSearchResult";

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  query: string;
  onResultClick: (result: SearchResult) => void;
}

const SearchResults = ({ 
  results, 
  isSearching, 
  query, 
  onResultClick 
}: SearchResultsProps) => {
  const navigate = useNavigate();

  const userResults = results.filter(r => r.type === 'user') as UserSearchResult[];
  const hashtagResults = results.filter(r => r.type === 'hashtag') as HashtagSearchResult[];
  const postResults = results.filter(r => r.type === 'post') as PostSearchResult[];
  
  return (
    <div className="absolute mt-1 w-full bg-background border border-border rounded-md shadow-lg z-50 max-h-[70vh] overflow-y-auto">
      {isSearching ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <>
          {userResults.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                People
              </div>
              {userResults.map(result => (
                <UserSearchResult 
                  key={`user-${result.id}`} 
                  result={result} 
                  onClick={onResultClick} 
                />
              ))}
            </>
          )}
          
          {hashtagResults.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                Hashtags
              </div>
              {hashtagResults.map(result => (
                <HashtagSearchResult 
                  key={`hashtag-${result.name}`} 
                  result={result} 
                  onClick={onResultClick} 
                />
              ))}
            </>
          )}
          
          {postResults.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                Posts
              </div>
              {postResults.map(result => (
                <PostSearchResult 
                  key={`post-${result.id}`} 
                  result={result} 
                  onClick={onResultClick} 
                />
              ))}
            </>
          )}
        </>
      ) : (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">No results found</p>
        </div>
      )}
      
      {query && (
        <div className="p-3 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate(`/advanced-search?q=${encodeURIComponent(query)}`)}
          >
            <Search size={16} className="mr-2" />
            Advanced search for "{query}"
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
