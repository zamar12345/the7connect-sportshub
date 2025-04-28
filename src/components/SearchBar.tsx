
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  searchAll,
  SearchResult,
} from "@/services/search";
import { Button } from "@/components/ui/button";
import SearchResults from "./search/SearchResults";

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
  const isControlled = value !== undefined && onChange !== undefined;
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isControlled && value !== query) {
      setQuery(value);
    }
  }, [value, isControlled, query]);

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
      
      {showResults && (
        <SearchResults
          results={results}
          isSearching={isSearching}
          query={query}
          onResultClick={handleResultClick}
        />
      )}
    </div>
  );
};

export default SearchBar;
