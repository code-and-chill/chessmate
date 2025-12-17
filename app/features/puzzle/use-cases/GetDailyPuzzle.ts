import type { IPuzzleRepository } from '../repositories/IPuzzleRepository';
import type { ApiEnvelope } from '@/types/puzzle';

export class GetDailyPuzzleError extends Error {
  constructor(message: string = 'Failed to fetch daily puzzle') {
    super(message);
    this.name = 'GetDailyPuzzleError';
  }
}

/**
 * GetDailyPuzzle Use Case
 * 
 * Fetches today's daily puzzle (or specific date).
 * 
 * Business rules:
 * - Date must be valid (if provided)
 */
export class GetDailyPuzzleUseCase {
  constructor(private puzzleRepository: IPuzzleRepository) {}

  async execute(date?: string): Promise<ApiEnvelope<any>> {
    try {
      return await this.puzzleRepository.getDailyPuzzle(date);
    } catch (error) {
      throw new GetDailyPuzzleError(
        error instanceof Error ? error.message : 'Failed to fetch daily puzzle'
      );
    }
  }
}
