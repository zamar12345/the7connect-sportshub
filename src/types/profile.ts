
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
  achievements?: Achievement[];
  stats?: Stat[];
}

export interface Achievement {
  title: string;
  year?: string | number;
  icon?: "trophy" | "medal" | "award";
}

export interface Stat {
  label: string;
  value: string | number;
}
