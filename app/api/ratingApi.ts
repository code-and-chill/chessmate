/**
 * Rating API client - handles player ratings, statistics, and leaderboards.
 */

export interface RatingHistory {
  date: string;
  rating: number;
  change: number;
}

export interface GameStats {
  timeControl: 'blitz' | 'rapid' | 'classical';
  rating: number;
  peak: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  rating: number;
  games: number;
  winRate: number;
  avatar: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export class RatingApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = 'http://localhost:8003', authToken?: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `Rating API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Get user statistics for a specific time control
   */
  async getStats(userId: string, timeControl: string): Promise<GameStats> {
    return this.request<GameStats>(
      'GET',
      `/api/v1/ratings/${userId}/stats?time_control=${timeControl}`
    );
  }

  /**
   * Get rating history
   */
  async getRatingHistory(
    userId: string,
    timeControl: string,
    days: number = 30
  ): Promise<RatingHistory[]> {
    return this.request<RatingHistory[]>(
      'GET',
      `/api/v1/ratings/${userId}/history?time_control=${timeControl}&days=${days}`
    );
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    type: 'global' | 'friends' | 'club',
    timeControl: string,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>(
      'GET',
      `/api/v1/ratings/leaderboard?type=${type}&time_control=${timeControl}&limit=${limit}`
    );
  }

  /**
   * Get user achievements
   */
  async getAchievements(userId: string): Promise<Achievement[]> {
    return this.request<Achievement[]>(
      'GET',
      `/api/v1/ratings/${userId}/achievements`
    );
  }

  /**
   * Update rating after game
   */
  async updateRating(
    userId: string,
    gameId: string,
    timeControl: string,
    result: 'win' | 'loss' | 'draw',
    opponentRating: number
  ): Promise<{ newRating: number; change: number }> {
    return this.request<{ newRating: number; change: number }>(
      'POST',
      `/api/v1/ratings/${userId}/update`,
      {
        gameId,
        timeControl,
        result,
        opponentRating,
      }
    );
  }
}
