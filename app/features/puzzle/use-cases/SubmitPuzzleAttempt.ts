import type { IPuzzleRepository } from '../repositories/IPuzzleRepository';
import type { PuzzleAttempt, PuzzleAttemptResponse, ApiEnvelope } from '@/types/puzzle';

export interface SubmitPuzzleAttemptParams {
  puzzleId: string;
  attempt: PuzzleAttempt;
}

export class SubmitPuzzleAttemptError extends Error {
  constructor(message: string = 'Failed to submit puzzle attempt') {
    super(message);
    this.name = 'SubmitPuzzleAttemptError';
  }
}

/**
 * SubmitPuzzleAttempt Use Case
 * 
 * Submits a puzzle attempt and handles rate limiting.
 * 
 * Business rules:
 * - Puzzle must exist
 * - Attempt must be valid
 * - Rate limiting must be respected
 */
export class SubmitPuzzleAttemptUseCase {
  constructor(private puzzleRepository: IPuzzleRepository) {}

  async execute(
    params: SubmitPuzzleAttemptParams
  ): Promise<ApiEnvelope<PuzzleAttemptResponse>> {
    try {
      const response = await this.puzzleRepository.submitAttempt(
        params.puzzleId,
        params.attempt
      );

      // Handle rate limiting (business rule)
      if (response.status === 429) {
        // Rate limited - return response with rate limit info
        return response;
      }

      if (!response.ok) {
        throw new SubmitPuzzleAttemptError(
          response.error || 'Failed to submit puzzle attempt'
        );
      }

      return response;
    } catch (error) {
      throw new SubmitPuzzleAttemptError(
        error instanceof Error ? error.message : 'Failed to submit puzzle attempt'
      );
    }
  }
}
