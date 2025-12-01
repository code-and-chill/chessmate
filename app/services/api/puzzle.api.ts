/**
 * Puzzle API client - handles communication with puzzle-api.
 */

import type { Puzzle } from '../../features/puzzle/types/Puzzle';

export interface PuzzleAttempt {
  isDaily: boolean;
  movesPlayed: string[];
  status: 'SUCCESS' | 'FAILED';
  timeSpentMs: number;
  hintsUsed: number;
}

export interface PuzzleAttemptResponse {
  id: string;
  puzzleId: string;
  ratingChange: number;
  status: string;
}

export class PuzzleApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `Puzzle API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch today's daily puzzle
   */
  async getDailyPuzzle(date?: string): Promise<Puzzle> {
    const path = date ? `/api/v1/puzzles/daily?date=${date}` : '/api/v1/puzzles/daily';
    const response = await this.request<{ daily_puzzle: { puzzle: Puzzle } }>('GET', path);
    return response.daily_puzzle.puzzle;
  }

  /**
   * Fetch a specific puzzle by ID
   */
  async getPuzzle(puzzleId: string): Promise<Puzzle> {
    return this.request<Puzzle>('GET', `/api/v1/puzzles/${puzzleId}`);
  }

  /**
   * Submit a puzzle attempt
   */
  async submitAttempt(
    puzzleId: string,
    attempt: PuzzleAttempt
  ): Promise<PuzzleAttemptResponse> {
    return this.request<PuzzleAttemptResponse>(
      'POST',
      `/api/v1/puzzles/${puzzleId}/attempt`,
      {
        is_daily: attempt.isDaily,
        moves_played: attempt.movesPlayed,
        status: attempt.status,
        time_spent_ms: attempt.timeSpentMs,
        hints_used: attempt.hintsUsed,
      }
    );
  }

  /**
   * Fetch user puzzle statistics
   */
  async getUserStats(userId: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      'GET',
      `/api/v1/puzzles/user/stats?user_id=${userId}`
    );
  }

  /**
   * Fetch user puzzle history
   */
  async getUserHistory(userId: string, limit: number = 10, offset: number = 0): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(
      'GET',
      `/api/v1/puzzles/user/history?user_id=${userId}&limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Get random puzzle with optional filters
   */
  async getRandomPuzzle(filters?: {
    difficulty?: string[];
    themes?: string[];
    ratingRange?: { min: number; max: number };
  }): Promise<Puzzle> {
    const params = new URLSearchParams();
    if (filters?.difficulty?.length) {
      params.append('difficulty', filters.difficulty.join(','));
    }
    if (filters?.themes?.length) {
      params.append('themes', filters.themes.join(','));
    }
    if (filters?.ratingRange) {
      params.append('min_rating', filters.ratingRange.min.toString());
      params.append('max_rating', filters.ratingRange.max.toString());
    }
    
    const query = params.toString();
    const path = query ? `/api/v1/puzzles/random?${query}` : '/api/v1/puzzles/random';
    return this.request<Puzzle>('GET', path);
  }

  /**
   * Get puzzles by theme
   */
  async getPuzzlesByTheme(theme: string, limit: number = 10): Promise<Puzzle[]> {
    return this.request<Puzzle[]>(
      'GET',
      `/api/v1/puzzles/theme/${theme}?limit=${limit}`
    );
  }
}