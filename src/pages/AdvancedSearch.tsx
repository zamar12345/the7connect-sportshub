
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { 
  searchUsers, 
  searchPosts, 
  searchHashtags,
  UserSearchResult, 
  PostSearchResult, 
  HashtagSearchResult 
} from "@/services/search";
import { useLocation, useNavigate } from "react-router-dom";
import AdvancedSearchFilters from "@/components/AdvancedSearchFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import SearchBarComponent from "@/components/search/SearchBar";
import UserSearchResults from "@/components/search/UserSearchResults";
import PostSearchResults from "@/components/search/PostSearchResults";
import HashtagSearchResults from "@/components/search/HashtagSearchResults";

type SortOption = "relevance" | "recent" | "popular";
type FilterOption = "all" | "verified" | "followed" | "sport";

interface SearchState {
  query: string;
  type: "users" | "posts" | "hashtags";
  sort: SortOption;
  filter: FilterOption;
  sport?: string;
}

const AdvancedSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [searchState, setSearchState] = useState<SearchState>({
    query: queryParams.get("q") || "",
    type: (queryParams.get("type") as "users" | "posts" | "hashtags") || "users",
    sort: (queryParams.get("sort") as SortOption) || "relevance",
    filter: (queryParams.get("filter") as FilterOption) || "all",
    sport: queryParams.get("sport") || undefined
  });

  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [posts, setPosts] = useState<PostSearchResult[]>([]);
  const [hashtags, setHashtags] = useState<HashtagSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("q", searchState.query);
    params.set("type", searchState.type);
    params.set("sort", searchState.sort);
    params.set("filter", searchState.filter);
    if (searchState.sport) params.set("sport", searchState.sport);
    
    navigate(`/advanced-search?${params.toString()}`, { replace: true });
  }, [searchState, navigate]);
  
  useEffect(() => {
    const performSearch = async () => {
      if (!searchState.query || searchState.query.length < 2) return;
      
      setLoading(true);
      try {
        const searchOptions = {
          sort: searchState.sort,
          filter: searchState.filter,
          sport: searchState.sport
        };
        
        switch (searchState.type) {
          case "users":
            const userResults = await searchUsers(searchState.query, searchOptions);
            setUsers(userResults);
            break;
          case "posts":
            const postResults = await searchPosts(searchState.query, searchOptions);
            setPosts(postResults);
            break;
          case "hashtags":
            const hashtagResults = await searchHashtags(searchState.query, searchOptions);
            setHashtags(hashtagResults);
            break;
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to perform search");
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [searchState.query, searchState.type, searchState.sort, searchState.filter, searchState.sport]);
  
  const handleTabChange = (value: string) => {
    setSearchState(prev => ({ ...prev, type: value as "users" | "posts" | "hashtags" }));
  };
  
  const handleSearchChange = (query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  };
  
  const handleFilterChange = (filter: FilterOption, sport?: string) => {
    setSearchState(prev => ({ ...prev, filter, sport }));
  };
  
  const handleSortChange = (sort: SortOption) => {
    setSearchState(prev => ({ ...prev, sort }));
  };
  
  return (
    <MobileLayout>
      <div className="container max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Advanced Search</h1>
        
        <div className="mb-4">
          <SearchBarComponent 
            className="w-full" 
            value={searchState.query}
            onChange={handleSearchChange}
            placeholder="Search users, posts, or hashtags" 
          />
        </div>
        
        <AdvancedSearchFilters
          activeFilter={searchState.filter}
          activeSort={searchState.sort}
          activeSport={searchState.sport}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          searchType={searchState.type}
        />
        
        <Tabs 
          value={searchState.type} 
          onValueChange={handleTabChange} 
          className="mt-6"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="hashtags">Topics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-2">
            <UserSearchResults 
              users={users} 
              loading={loading} 
              searchQuery={searchState.query} 
            />
          </TabsContent>
          
          <TabsContent value="posts" className="mt-2">
            <PostSearchResults 
              posts={posts} 
              loading={loading} 
              searchQuery={searchState.query} 
            />
          </TabsContent>
          
          <TabsContent value="hashtags" className="mt-2">
            <HashtagSearchResults 
              hashtags={hashtags} 
              loading={loading} 
              searchQuery={searchState.query} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default AdvancedSearch;
