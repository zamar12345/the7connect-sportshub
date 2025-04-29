
export interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  sport?: string;
  disciplines?: string[];
  followers?: number;
  following?: number;
}
