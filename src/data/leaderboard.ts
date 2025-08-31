// Mock "database" for leaderboard data
// Centralized so both API routes and pages can reuse it.

export interface LeaderboardUser {
  id: string;
  username: string;
  fullName: string;
  country: string;
  avatarUrl: string;
  level: number;
  xp: number;
  rank: number;
  coins: number;
  gems: number;
  dailyStreak: number;
  totalSearches: number;
  totalQuizzes: number;
  totalInnovations: number;
  achievementCount: number;
  progress: number;
  streak: number;
  achievements: number;
}

// Helper function to generate avatar URL
const avatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

// Mock leaderboard data
export const leaderboardData: LeaderboardUser[] = [
  {
    rank: 1,
    id: 'user_1',
    username: 'Global_Explorer',
    fullName: 'Alex Johnson',
    country: 'United States',
    avatarUrl: avatarUrl('Alex Johnson'),
    level: 25,
    xp: 15800,
    coins: 2850,
    gems: 45,
    dailyStreak: 127,
    totalSearches: 342,
    totalQuizzes: 89,
    totalInnovations: 12,
    achievementCount: 23,
    progress: 85,
    streak: 14,
    achievements: 23
  },
  {
    rank: 2,
    id: 'user_2',
    username: 'UN_Explorer',
    fullName: 'Maria Garcia',
    country: 'Spain',
    avatarUrl: avatarUrl('Maria Garcia'),
    level: 23,
    xp: 14200,
    coins: 2650,
    gems: 38,
    dailyStreak: 95,
    totalSearches: 298,
    totalQuizzes: 76,
    totalInnovations: 15,
    achievementCount: 21,
    progress: 75,
    streak: 10,
    achievements: 21
  },
  {
    rank: 3,
    id: 'user_3',
    username: 'Tech_Wizard',
    fullName: 'James Wilson',
    country: 'United Kingdom',
    avatarUrl: avatarUrl('James Wilson'),
    level: 22,
    xp: 13800,
    coins: 2450,
    gems: 42,
    dailyStreak: 112,
    totalSearches: 321,
    totalQuizzes: 82,
    totalInnovations: 18,
    achievementCount: 25,
    progress: 80,
    streak: 21,
    achievements: 25
  },
  {
    rank: 4,
    id: 'user_4',
    username: 'Eco_Champion',
    fullName: 'Sarah Lee',
    country: 'Canada',
    avatarUrl: avatarUrl('Sarah Lee'),
    level: 21,
    xp: 13200,
    coins: 2250,
    gems: 36,
    dailyStreak: 88,
    totalSearches: 287,
    totalQuizzes: 71,
    totalInnovations: 14,
    achievementCount: 19,
    progress: 70,
    streak: 7,
    achievements: 19
  },
  {
    rank: 5,
    id: 'user_5',
    username: 'Global_Citizen',
    fullName: 'David Kim',
    country: 'South Korea',
    avatarUrl: avatarUrl('David Kim'),
    level: 20,
    xp: 12500,
    coins: 2050,
    gems: 40,
    dailyStreak: 102,
    totalSearches: 265,
    totalQuizzes: 68,
    totalInnovations: 16,
    achievementCount: 22,
    progress: 78,
    streak: 15,
    achievements: 22
  }
];

export function getLeaderboard(): LeaderboardUser[] {
  return leaderboardData;
}
