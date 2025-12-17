import type { IPuzzleRepository } from '../repositories/IPuzzleRepository';
import type { Puzzle, ApiEnvelope } from '@/types/puzzle';
import type { GetRandomPuzzleParams } from '../repositories/IPuzzleRepository';

export class GetRandomPuzzleError extends Error {
  constructor(message: string = 'Failed to fetch random puzzle') {
    super(message);
    this.name = 'GetRandomPuzzleError';
  }
}

/**
 * GetRandomPuzzle Use Case
 * 
 * Fetches a random puzzle with optional filters.
 * 
 * Business rules:
 * - Filters must be valid
 */
export class GetRandomPuzzleUseCase {
  constructor(private puzzleRepository: IPuzzleRepository) {}

  async execute(filters?: GetRandomPuzzleParams): Promise<ApiEnvelope<Puzzle>> {
    try {
      return await this.puzzleRepository.getRandomPuzzle(filters);
    } catch (error) {
      throw new GetRandomPuzzleError(
        error instanceof Error ? error.message : 'Failed to fetch random puzzle'
      );
    }
  }
}
