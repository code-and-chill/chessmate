export interface RatingHistory {
  date: string;
  rating: number;
  change: number;
}

export interface GameStats {
  timeControl: 'blitz' | 'rapid' | 'classical';
  rating: number;
  peak: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  rating: number;
  games: number;
  winRate: number;
  avatar: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: { current: number; total: number };
}

