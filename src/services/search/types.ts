
// Search types
export type SearchResultType = 'user' | 'post' | 'hashtag';
export type SortOption = 'relevance' | 'recent' | 'popular';
export type FilterOption = 'all' | 'verified' | 'followed' | 'sport';

export interface BaseSearchResult {
  id: string;
  type: SearchResultType;
}

export interface UserSearchResult extends BaseSearchResult {
  type: 'user';
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  sport?: string;
  followers?: number;
  created_at?: string;
  isVerified?: boolean;
}

export interface PostSearchResult extends BaseSearchResult {
  type: 'post';
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  likes_count?: number;
}

export interface HashtagSearchResult extends BaseSearchResult {
  type: 'hashtag';
  name: string;
  post_count: number;
  last_used_at?: string;
}

export type SearchResult = UserSearchResult | PostSearchResult | HashtagSearchResult;

export interface SearchOptions {
  sort?: SortOption;
  filter?: FilterOption;
  sport?: string;
  limit?: number;
  currentUserId?: string; // Added this property for currentUserId
}
