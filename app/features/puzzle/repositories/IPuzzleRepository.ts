import type { Puzzle, PuzzleAttempt, PuzzleAttemptResponse, ApiEnvelope } from '@/types/puzzle';

export interface GetRandomPuzzleParams {
  difficulty?: string[];
  themes?: string[];
  ratingRange?: { min: number; max: number };
}

export interface GetPuzzlesByThemeParams {
  theme: string;
  limit?: number;
}

export interface GetUserHistoryParams {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface IPuzzleRepository {
  /**
   * Get a puzzle by ID
   */
  getPuzzle(puzzleId: string): Promise<ApiEnvelope<Puzzle>>;

  /**
   * Get today's daily puzzle (or specific date)
   */
  getDailyPuzzle(date?: string): Promise<ApiEnvelope<any>>;

  /**
   * Submit a puzzle attempt
   */
  submitAttempt(puzzleId: string, attempt: PuzzleAttempt): Promise<ApiEnvelope<PuzzleAttemptResponse>>;

  /**
   * Get a random puzzle with optional filters
   */
  getRandomPuzzle(filters?: GetRandomPuzzleParams): Promise<ApiEnvelope<Puzzle>>;

  /**
   * Get puzzles by theme
   */
  getPuzzlesByTheme(params: GetPuzzlesByThemeParams): Promise<ApiEnvelope<Puzzle[]>>;

  /**
   * Get user puzzle statistics
   */
  getUserStats(userId: string): Promise<ApiEnvelope<any>>;

  /**
   * Get user puzzle attempt history
   */
  getUserHistory(params: GetUserHistoryParams): Promise<ApiEnvelope<any>>;
}
