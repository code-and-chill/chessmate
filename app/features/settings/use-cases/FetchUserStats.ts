import type { IRatingRepository } from '../../game/repositories/IRatingRepository';
import type { GameStats } from '@/types/rating';

export interface FetchUserStatsParams {
  userId: string;
  timeControl: string;
}

export class FetchUserStatsError extends Error {
  constructor(message: string = 'Failed to fetch user stats') {
    super(message);
    this.name = 'FetchUserStatsError';
  }
}

/**
 * FetchUserStats Use Case
 * 
 * Fetches user statistics for a specific time control.
 * 
 * Business rules:
 * - User must exist
 * - Time control must be valid
 */
export class FetchUserStatsUseCase {
  constructor(private ratingRepository: IRatingRepository) {}

  async execute(params: FetchUserStatsParams): Promise<GameStats> {
    try {
      return await this.ratingRepository.getStats({
        userId: params.userId,
        timeControl: params.timeControl,
      });
    } catch (error) {
      throw new FetchUserStatsError(
        error instanceof Error ? error.message : 'Failed to fetch user stats'
      );
    }
  }
}
