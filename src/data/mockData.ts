export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  sport: string;
  followers: number;
  following: number;
  isVerified?: boolean;
  disciplines?: string[];
  achievements?: {
    title: string;
    year: string;
    icon?: "trophy" | "medal" | "award";
  }[];
  stats?: {
    label: string;
    value: string;
  }[];
  full_name: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  images?: string[];
  video?: string;
  likes: number;
  comments: number;
  reposts: number;
  timestamp: string;
  hashtags?: string[];
  liked?: boolean;
  reposted?: boolean;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

export const currentUser: User = {
  id: "user-1",
  name: "Alex Johnson",
  username: "alexjbasketball",
  avatar: "/placeholder.svg",
  bio: "Professional basketball player | 3x MVP | Living the dream one dribble at a time",
  sport: "Basketball",
  followers: 845,
  following: 231,
  isVerified: true,
  disciplines: ["Point Guard", "Shooting Guard"],
  achievements: [
    { title: "NBA All-Star", year: "2024", icon: "trophy" },
    { title: "League MVP", year: "2023", icon: "medal" },
    { title: "Rookie of the Year", year: "2020", icon: "award" }
  ],
  stats: [
    { label: "Points per game", value: "28.5" },
    { label: "Assists", value: "9.2" },
    { label: "Field goal %", value: "52.3" }
  ],
  full_name: "Alex Johnson"
};

export const mockUsers: User[] = [
  currentUser,
  {
    id: "user-2",
    name: "Sarah Williams",
    username: "sarahtennis",
    avatar: "/placeholder.svg",
    bio: "Tennis pro | Grand Slam winner | Sports enthusiast",
    sport: "Tennis",
    followers: 1254,
    following: 432,
    isVerified: true,
    full_name: "Sarah Williams"
  },
  {
    id: "user-3",
    name: "Mike Rodriguez",
    username: "mikethecoach",
    avatar: "/placeholder.svg",
    bio: "Football coach | Developing champions | Career adviser",
    sport: "Football",
    followers: 764,
    following: 221,
    full_name: "Mike Rodriguez"
  },
  {
    id: "user-4",
    name: "Jenny Kim",
    username: "jennyswimmer",
    avatar: "/placeholder.svg",
    bio: "Olympic swimmer | World record holder | Inspiring the next generation",
    sport: "Swimming",
    followers: 2410,
    following: 189,
    isVerified: true,
    full_name: "Jenny Kim"
  }
];

export const mockPosts: Post[] = [
  {
    id: "post-1",
    user: mockUsers[1],
    content: "Just finished an amazing training session! Feeling ready for the tournament next week. 💪",
    images: ["/placeholder.svg"],
    likes: 124,
    comments: 23,
    reposts: 7,
    timestamp: "2h",
    hashtags: ["training", "tennis", "tournament"],
    liked: true,
    created_at: new Date().toISOString(),
    likes_count: 124,
    comments_count: 23
  },
  {
    id: "post-2",
    user: mockUsers[0],
    content: "Game day! Who's coming to support us tonight? Tickets still available! #HomeGame",
    likes: 87,
    comments: 14,
    reposts: 3,
    timestamp: "4h",
    hashtags: ["basketball", "gameday", "HomeGame"],
    created_at: new Date().toISOString(),
    likes_count: 87,
    comments_count: 14
  },
  {
    id: "post-3",
    user: mockUsers[2],
    content: "Looking for new talents for our youth academy. Open trials next Saturday. Share with anyone interested! DM for details.",
    likes: 201,
    comments: 45,
    reposts: 67,
    timestamp: "7h",
    hashtags: ["football", "recruiting", "academy", "youth"],
    created_at: new Date().toISOString(),
    likes_count: 201,
    comments_count: 45
  },
  {
    id: "post-4",
    user: mockUsers[3],
    content: "New personal best today! Thanks to everyone who supported me through the journey. The hard work is paying off!",
    images: ["/placeholder.svg"],
    likes: 345,
    comments: 56,
    reposts: 21,
    timestamp: "9h",
    hashtags: ["swimming", "personalbest", "hardwork"],
    created_at: new Date().toISOString(),
    likes_count: 345,
    comments_count: 56
  },
  {
    id: "post-5",
    user: mockUsers[1],
    content: "Taking a rest day today. What are your favorite recovery techniques? Looking for new ideas!",
    likes: 76,
    comments: 32,
    reposts: 5,
    timestamp: "11h",
    hashtags: ["recovery", "selfcare", "athletelife"],
    created_at: new Date().toISOString(),
    likes_count: 76,
    comments_count: 32
  },
  {
    id: "post-6",
    user: mockUsers[0],
    content: "Excited to announce my partnership with @SportsBrand! New signature shoes dropping next month. Stay tuned! #SponsoredPost",
    images: ["/placeholder.svg"],
    likes: 423,
    comments: 89,
    reposts: 112,
    timestamp: "1d",
    hashtags: ["partnership", "basketball", "SponsoredPost"],
    created_at: new Date().toISOString(),
    likes_count: 423,
    comments_count: 89
  }
];

export const mockStories = [
  {
    id: "story-1",
    user: mockUsers[0],
    image: "/placeholder.svg",
    viewed: false
  },
  {
    id: "story-2",
    user: mockUsers[1],
    image: "/placeholder.svg",
    viewed: false
  },
  {
    id: "story-3",
    user: mockUsers[2],
    image: "/placeholder.svg",
    viewed: true
  },
  {
    id: "story-4",
    user: mockUsers[3],
    image: "/placeholder.svg",
    viewed: false
  }
];

export const mockTrendingTopics = [
  {
    id: "trend-1",
    name: "#OlympicQualifiers",
    posts: 35640
  },
  {
    id: "trend-2",
    name: "#TransferSeason",
    posts: 29450
  },
  {
    id: "trend-3",
    name: "#AthleteLife",
    posts: 18320
  },
  {
    id: "trend-4",
    name: "#TrainingDay",
    posts: 12750
  }
];
