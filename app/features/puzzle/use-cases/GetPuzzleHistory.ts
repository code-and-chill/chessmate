import type { IPuzzleRepository } from '../repositories/IPuzzleRepository';
import type { ApiEnvelope } from '@/types/puzzle';

export interface GetPuzzleHistoryParams {
  userId: string;
  limit?: number;
  offset?: number;
}

/**
 * GetPuzzleHistory Use Case
 * 
 * Fetches user's puzzle attempt history.
 * 
 * Business rules:
 * - User must exist
 * - Pagination limits must be respected
 */
export class GetPuzzleHistoryUseCase {
  constructor(private puzzleRepository: IPuzzleRepository) {}

  async execute(
    params: GetPuzzleHistoryParams
  ): Promise<ApiEnvelope<any>> {
    try {
      return await this.puzzleRepository.getUserHistory({
        userId: params.userId,
        limit: params.limit ?? 10,
        offset: params.offset ?? 0,
      });
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch puzzle history'
      );
    }
  }
}
