import type { IRatingRepository } from '../../game/repositories/IRatingRepository';
import type { GameStats } from '@/types/rating';

export interface FetchSocialStatsParams {
  userId: string;
  timeControl: string;
}

export class FetchSocialStatsError extends Error {
  constructor(message: string = 'Failed to fetch social stats') {
    super(message);
    this.name = 'FetchSocialStatsError';
  }
}

/**
 * FetchSocialStats Use Case
 * 
 * Fetches user's social statistics (game stats).
 * 
 * Business rules:
 * - User must exist
 * - Time control must be valid
 */
export class FetchSocialStatsUseCase {
  constructor(private ratingRepository: IRatingRepository) {}

  async execute(params: FetchSocialStatsParams): Promise<GameStats> {
    try {
      return await this.ratingRepository.getStats({
        userId: params.userId,
        timeControl: params.timeControl,
      });
    } catch (error) {
      throw new FetchSocialStatsError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch social stats'
      );
    }
  }
}
