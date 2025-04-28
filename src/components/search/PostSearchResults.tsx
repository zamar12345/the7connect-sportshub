
import { PostSearchResult } from "@/services/search";
import { Loader2 } from "lucide-react";
import PostCard from "@/components/PostCard";

interface PostSearchResultsProps {
  posts: PostSearchResult[];
  loading: boolean;
  searchQuery: string;
}

const PostSearchResults = ({ posts, loading, searchQuery }: PostSearchResultsProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
  
  if (posts.length === 0) {
    if (searchQuery.length >= 2) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No posts found matching "{searchQuery}"
        </div>
      );
    }
    
    return (
      <div className="text-center py-8 text-muted-foreground">
        Enter a search term to find posts
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="mb-4">
          <PostCard 
            post={{
              id: post.id,
              content: post.content,
              created_at: post.created_at,
              user: {
                id: post.user_id,
                username: post.username,
                avatar_url: post.avatar_url,
                isVerified: false,
                full_name: post.username
              },
              likes_count: post.likes_count || 0,
              comments_count: 0,
            }} 
          />
        </div>
      ))}
    </div>
  );
};

export default PostSearchResults;
