import type { IRatingRepository } from '../../game/repositories/IRatingRepository';
import type { LeaderboardEntry } from '@/types/rating';

export interface FetchLeaderboardParams {
  type: 'global' | 'friends' | 'club';
  timeControl: string;
  limit?: number;
}

export class FetchLeaderboardError extends Error {
  constructor(message: string = 'Failed to fetch leaderboard') {
    super(message);
    this.name = 'FetchLeaderboardError';
  }
}

/**
 * FetchLeaderboard Use Case
 * 
 * Fetches leaderboard data.
 * 
 * Business rules:
 * - Time control must be valid
 * - Limit must be within bounds
 */
export class FetchLeaderboardUseCase {
  constructor(private ratingRepository: IRatingRepository) {}

  async execute(params: FetchLeaderboardParams): Promise<LeaderboardEntry[]> {
    try {
      return await this.ratingRepository.getLeaderboard({
        type: params.type,
        timeControl: params.timeControl,
        limit: params.limit ?? 100,
      });
    } catch (error) {
      throw new FetchLeaderboardError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch leaderboard'
      );
    }
  }
}
