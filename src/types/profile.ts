
export type Achievement = {
  title: string;
  year: string;
  icon?: "trophy" | "medal" | "award";
};

export type Stat = {
  label: string;
  value: string | number;
};

export type ProfileData = {
  id: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  sport?: string;
  disciplines?: string[];
  followers?: number;
  following?: number;
  achievements?: Achievement[];
  stats?: Stat[];
};
