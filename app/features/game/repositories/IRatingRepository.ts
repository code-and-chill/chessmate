import type {
  RatingHistory,
  GameStats,
  LeaderboardEntry,
  Achievement,
} from '@/types/rating';

export interface GetStatsParams {
  userId: string;
  timeControl: string;
}

export interface GetRatingHistoryParams {
  userId: string;
  timeControl: string;
  days?: number;
}

export interface GetLeaderboardParams {
  type: 'global' | 'friends' | 'club';
  timeControl: string;
  limit?: number;
}

export interface UpdateRatingParams {
  userId: string;
  gameId: string;
  timeControl: string;
  result: 'win' | 'loss' | 'draw';
  opponentRating: number;
}

export interface IRatingRepository {
  /**
   * Get user statistics for a specific time control
   */
  getStats(params: GetStatsParams): Promise<GameStats>;

  /**
   * Get rating history
   */
  getRatingHistory(params: GetRatingHistoryParams): Promise<RatingHistory[]>;

  /**
   * Get leaderboard
   */
  getLeaderboard(params: GetLeaderboardParams): Promise<LeaderboardEntry[]>;

  /**
   * Get user achievements
   */
  getAchievements(userId: string): Promise<Achievement[]>;

  /**
   * Update rating after game
   */
  updateRating(params: UpdateRatingParams): Promise<{ newRating: number; change: number }>;
}
