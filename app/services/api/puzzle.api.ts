import type { Puzzle, PuzzleAttempt, PuzzleAttemptResponse, ApiEnvelope } from '@/types/puzzle';

export interface IPuzzleApiClient {
  getPuzzle(puzzleId: string): Promise<ApiEnvelope<Puzzle>>;
  getDailyPuzzle(date?: string): Promise<ApiEnvelope<any>>;
  submitAttempt(puzzleId: string, attempt: PuzzleAttempt): Promise<ApiEnvelope<PuzzleAttemptResponse>>;
  getRandomPuzzle(filters?: { difficulty?: string[]; themes?: string[]; ratingRange?: { min: number; max: number } }): Promise<ApiEnvelope<Puzzle>>;
  getPuzzlesByTheme(theme: string, limit?: number): Promise<ApiEnvelope<Puzzle[]>>;
  getUserStats(userId: string): Promise<ApiEnvelope<any>>;
  getUserHistory(userId: string, limit?: number, offset?: number): Promise<ApiEnvelope<any>>;
}

export class PuzzleApiClient implements IPuzzleApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  private async request<T = any>(method: string, path: string, body?: unknown): Promise<ApiEnvelope<T>> {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const status = response.status;

      let json: any;
      try {
        const text = await response.text();
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      const rateLimit = (json && (json.rate_limit || json.rateLimit)) ? (json.rate_limit || json.rateLimit) : null;

      if (!response.ok) {
        const errorMessage = json && (json.error || json.message) ? (json.error || json.message) : response.statusText || 'Request failed';
        return { ok: false, status, error: errorMessage, rateLimit };
      }

      return { ok: true, status, result: (json as T) ?? undefined, rateLimit };
    } catch (err: any) {
      return { ok: false, status: 0, error: err?.message ?? 'Network error', rateLimit: null };
    }
  }

  async getPuzzle(puzzleId: string): Promise<ApiEnvelope<Puzzle>> {
    return this.request<Puzzle>('GET', `/api/v1/puzzles/${encodeURIComponent(puzzleId)}`);
  }

  async getDailyPuzzle(date?: string): Promise<ApiEnvelope<any>> {
    const path = date ? `/api/v1/puzzles/daily?date=${encodeURIComponent(date)}` : `/api/v1/puzzles/daily`;
    return this.request<any>('GET', path);
  }

  async submitAttempt(puzzleId: string, attempt: PuzzleAttempt): Promise<ApiEnvelope<PuzzleAttemptResponse>> {
    const payload = {
      is_daily: attempt.isDaily,
      moves_played: attempt.movesPlayed,
      status: attempt.status,
      time_spent_ms: attempt.timeSpentMs,
      hints_used: attempt.hintsUsed,
    };
    return this.request<PuzzleAttemptResponse>('POST', `/api/v1/puzzles/${encodeURIComponent(puzzleId)}/attempt`, payload);
  }

  async getRandomPuzzle(filters?: { difficulty?: string[]; themes?: string[]; ratingRange?: { min: number; max: number } }): Promise<ApiEnvelope<Puzzle>> {
    const params = new URLSearchParams();
    if (filters?.difficulty?.length) params.append('difficulty', filters.difficulty.join(','));
    if (filters?.themes?.length) params.append('themes', filters.themes.join(','));
    if (filters?.ratingRange) {
      params.append('min_rating', String(filters.ratingRange.min));
      params.append('max_rating', String(filters.ratingRange.max));
    }
    const query = params.toString();
    const path = query ? `/api/v1/puzzles/random?${query}` : '/api/v1/puzzles/random';
    return this.request<Puzzle>('GET', path);
  }

  async getPuzzlesByTheme(theme: string, limit: number = 10): Promise<ApiEnvelope<Puzzle[]>> {
    return this.request<Puzzle[]>('GET', `/api/v1/puzzles/theme/${encodeURIComponent(theme)}?limit=${limit}`);
  }

  async getUserStats(userId: string): Promise<ApiEnvelope<any>> {
    return this.request('GET', `/api/v1/puzzles/user/stats?user_id=${encodeURIComponent(userId)}`);
  }

  async getUserHistory(userId: string, limit: number = 10, offset: number = 0): Promise<ApiEnvelope<any>> {
    return this.request('GET', `/api/v1/puzzles/user/history?user_id=${encodeURIComponent(userId)}&limit=${limit}&offset=${offset}`);
  }
}
