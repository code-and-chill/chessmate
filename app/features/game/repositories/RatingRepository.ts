import type { IRatingApiClient } from '@/services/api';
import type {
  IRatingRepository,
  GetStatsParams,
  GetRatingHistoryParams,
  GetLeaderboardParams,
  UpdateRatingParams,
} from './IRatingRepository';

/**
 * Rating Repository Implementation
 * 
 * Wraps IRatingApiClient to provide repository abstraction.
 */
export class RatingRepository implements IRatingRepository {
  constructor(private apiClient: IRatingApiClient) {}

  async getStats(params: GetStatsParams) {
    return this.apiClient.getStats(params.userId, params.timeControl);
  }

  async getRatingHistory(params: GetRatingHistoryParams) {
    return this.apiClient.getRatingHistory(
      params.userId,
      params.timeControl,
      params.days
    );
  }

  async getLeaderboard(params: GetLeaderboardParams) {
    return this.apiClient.getLeaderboard(
      params.type,
      params.timeControl,
      params.limit
    );
  }

  async getAchievements(userId: string) {
    return this.apiClient.getAchievements(userId);
  }

  async updateRating(params: UpdateRatingParams) {
    return this.apiClient.updateRating(
      params.userId,
      params.gameId,
      params.timeControl,
      params.result,
      params.opponentRating
    );
  }
}
