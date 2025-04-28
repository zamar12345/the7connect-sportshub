
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, User, MessageSquare, Hash, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  searchAll,
  SearchResult,
  UserSearchResult, 
  PostSearchResult,
  HashtagSearchResult
} from "@/services/searchService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (query: string) => void;
}

const SearchBar = ({ 
  className = "", 
  placeholder = "Search users, posts, or hashtags",
  value,
  onChange
}: SearchBarProps) => {
  // Use controlled or uncontrolled input based on props
  const isControlled = value !== undefined && onChange !== undefined;
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Update internal state when controlled value changes
  useEffect(() => {
    if (isControlled && value !== query) {
      setQuery(value);
    }
  }, [value, isControlled]);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  const performSearch = async () => {
    if (!query) return;
    
    setIsSearching(true);
    const searchResults = await searchAll(query);
    setResults(searchResults);
    setIsSearching(false);
    setShowResults(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    if (isControlled && onChange) {
      onChange(newValue);
    }
  };
  
  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    
    if (isControlled && onChange) {
      onChange("");
    }
  };
  
  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    
    switch (result.type) {
      case 'user':
        navigate(`/profile/${result.username}`);
        break;
      case 'post':
        navigate(`/post/${result.id}`);
        break;
      case 'hashtag':
        navigate(`/explore/tag/${result.name}`);
        break;
    }
  };
  
  const renderUserResult = (result: UserSearchResult) => (
    <div 
      key={`user-${result.id}`}
      className="flex items-center p-3 hover:bg-muted cursor-pointer"
      onClick={() => handleResultClick(result)}
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
  
  const renderPostResult = (result: PostSearchResult) => (
    <div 
      key={`post-${result.id}`}
      className="flex items-start p-3 hover:bg-muted cursor-pointer"
      onClick={() => handleResultClick(result)}
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
  
  const renderHashtagResult = (result: HashtagSearchResult) => (
    <div 
      key={`hashtag-${result.name}`}
      className="flex items-center p-3 hover:bg-muted cursor-pointer"
      onClick={() => handleResultClick(result)}
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

  return (
    <div className={`relative ${className}`} ref={searchContainerRef}>
      <div className="relative">
        <Search 
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
        />
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10"
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 h-full"
            onClick={handleClear}
          >
            <X size={18} />
          </Button>
        )}
      </div>
      
      {/* Search results dropdown */}
      {showResults && (
        <div className="absolute mt-1 w-full bg-background border border-border rounded-md shadow-lg z-50 max-h-[70vh] overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.some(r => r.type === 'user') && (
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                  People
                </div>
              )}
              {results.filter(r => r.type === 'user')
                .map(result => renderUserResult(result as UserSearchResult))}
              
              {results.some(r => r.type === 'hashtag') && (
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                  Hashtags
                </div>
              )}
              {results.filter(r => r.type === 'hashtag')
                .map(result => renderHashtagResult(result as HashtagSearchResult))}
              
              {results.some(r => r.type === 'post') && (
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                  Posts
                </div>
              )}
              {results.filter(r => r.type === 'post')
                .map(result => renderPostResult(result as PostSearchResult))}
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
      )}
    </div>
  );
};

export default SearchBar;
