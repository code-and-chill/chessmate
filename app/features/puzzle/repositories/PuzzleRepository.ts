import type { IPuzzleApiClient } from '@/services/api';
import type {
  IPuzzleRepository,
  GetRandomPuzzleParams,
  GetPuzzlesByThemeParams,
  GetUserHistoryParams,
} from './IPuzzleRepository';
import type { Puzzle, PuzzleAttempt, PuzzleAttemptResponse, ApiEnvelope } from '@/types/puzzle';

/**
 * Puzzle Repository Implementation
 * 
 * Wraps IPuzzleApiClient to provide repository abstraction.
 */
export class PuzzleRepository implements IPuzzleRepository {
  constructor(private apiClient: IPuzzleApiClient) {}

  async getPuzzle(puzzleId: string): Promise<ApiEnvelope<Puzzle>> {
    return this.apiClient.getPuzzle(puzzleId);
  }

  async getDailyPuzzle(date?: string): Promise<ApiEnvelope<any>> {
    return this.apiClient.getDailyPuzzle(date);
  }

  async submitAttempt(
    puzzleId: string,
    attempt: PuzzleAttempt
  ): Promise<ApiEnvelope<PuzzleAttemptResponse>> {
    return this.apiClient.submitAttempt(puzzleId, attempt);
  }

  async getRandomPuzzle(
    filters?: GetRandomPuzzleParams
  ): Promise<ApiEnvelope<Puzzle>> {
    return this.apiClient.getRandomPuzzle(filters);
  }

  async getPuzzlesByTheme(
    params: GetPuzzlesByThemeParams
  ): Promise<ApiEnvelope<Puzzle[]>> {
    return this.apiClient.getPuzzlesByTheme(params.theme, params.limit);
  }

  async getUserStats(userId: string): Promise<ApiEnvelope<any>> {
    return this.apiClient.getUserStats(userId);
  }

  async getUserHistory(
    params: GetUserHistoryParams
  ): Promise<ApiEnvelope<any>> {
    return this.apiClient.getUserHistory(params.userId, params.limit, params.offset);
  }
}
