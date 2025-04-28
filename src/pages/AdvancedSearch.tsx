
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import SearchBar from "@/components/SearchBar";
import { 
  searchUsers, 
  searchPosts, 
  searchHashtags,
  UserSearchResult, 
  PostSearchResult, 
  HashtagSearchResult 
} from "@/services/searchService";
import { useLocation, useNavigate } from "react-router-dom";
import AdvancedSearchFilters from "@/components/AdvancedSearchFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, Hash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import FollowButton from "@/components/FollowButton";
import PostCard from "@/components/PostCard";

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
  
  // Initialize state from URL parameters
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
  
  // Update URL when search state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("q", searchState.query);
    params.set("type", searchState.type);
    params.set("sort", searchState.sort);
    params.set("filter", searchState.filter);
    if (searchState.sport) params.set("sport", searchState.sport);
    
    navigate(`/advanced-search?${params.toString()}`, { replace: true });
  }, [searchState, navigate]);
  
  // Perform search when query or filters change
  useEffect(() => {
    const performSearch = async () => {
      if (!searchState.query || searchState.query.length < 2) return;
      
      setLoading(true);
      try {
        switch (searchState.type) {
          case "users":
            const userResults = await searchUsers(searchState.query);
            setUsers(userResults);
            break;
          case "posts":
            const postResults = await searchPosts(searchState.query);
            setPosts(postResults);
            break;
          case "hashtags":
            const hashtagResults = await searchHashtags(searchState.query);
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
          <SearchBar 
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
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : users.length > 0 ? (
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
            ) : searchState.query.length >= 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching "{searchState.query}"
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Enter a search term to find users
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="posts" className="mt-2">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="mb-4">
                    {/* Using the PostCard component */}
                    <PostCard 
                      post={{
                        id: post.id,
                        content: post.content,
                        created_at: post.created_at,
                        user: {
                          id: post.user_id,
                          name: post.username,
                          username: post.username,
                          avatar: post.avatar_url,
                          isVerified: false
                        },
                        likes: 0,
                        comments: 0,
                        isLiked: false
                      }} 
                    />
                  </div>
                ))}
              </div>
            ) : searchState.query.length >= 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                No posts found matching "{searchState.query}"
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Enter a search term to find posts
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="hashtags" className="mt-2">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : hashtags.length > 0 ? (
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
            ) : searchState.query.length >= 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                No topics found matching "{searchState.query}"
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Enter a search term to find topics
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default AdvancedSearch;
