import type { IPuzzleRepository } from '../repositories/IPuzzleRepository';
import type { Puzzle, ApiEnvelope } from '@/types/puzzle';

export class PuzzleNotFoundError extends Error {
  constructor(puzzleId: string) {
    super(`Puzzle ${puzzleId} not found`);
    this.name = 'PuzzleNotFoundError';
  }
}

/**
 * GetPuzzle Use Case
 * 
 * Fetches a puzzle by ID.
 * 
 * Business rules:
 * - Puzzle must exist
 */
export class GetPuzzleUseCase {
  constructor(private puzzleRepository: IPuzzleRepository) {}

  async execute(puzzleId: string): Promise<ApiEnvelope<Puzzle>> {
    try {
      const response = await this.puzzleRepository.getPuzzle(puzzleId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new PuzzleNotFoundError(puzzleId);
        }
        throw new Error(response.error || 'Failed to fetch puzzle');
      }

      return response;
    } catch (error) {
      if (error instanceof PuzzleNotFoundError) {
        throw error;
      }
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch puzzle'
      );
    }
  }
}
