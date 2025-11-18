/**
 * Matchmaking API client - handles game matching and queue management.
 */

export interface MatchmakingRequest {
  userId: string;
  timeControl: string;
  ratingRange?: {
    min: number;
    max: number;
  };
}

export interface MatchFound {
  gameId: string;
  opponentId: string;
  opponentUsername: string;
  opponentRating: number;
  timeControl: string;
  color: 'white' | 'black';
}

export interface QueueStatus {
  inQueue: boolean;
  position?: number;
  estimatedWaitTime?: number;
}

export class MatchmakingApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = 'http://localhost:8004', authToken?: string) {
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
        `Matchmaking API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Join matchmaking queue
   */
  async joinQueue(request: MatchmakingRequest): Promise<QueueStatus> {
    return this.request<QueueStatus>(
      'POST',
      '/api/v1/matchmaking/queue',
      request
    );
  }

  /**
   * Leave matchmaking queue
   */
  async leaveQueue(userId: string): Promise<void> {
    await this.request('DELETE', `/api/v1/matchmaking/queue/${userId}`);
  }

  /**
   * Get queue status
   */
  async getQueueStatus(userId: string): Promise<QueueStatus> {
    return this.request<QueueStatus>(
      'GET',
      `/api/v1/matchmaking/queue/${userId}/status`
    );
  }

  /**
   * Poll for match (long polling)
   */
  async pollForMatch(
    userId: string,
    timeout: number = 30000
  ): Promise<MatchFound | null> {
    try {
      return await this.request<MatchFound>(
        'GET',
        `/api/v1/matchmaking/queue/${userId}/match?timeout=${timeout}`
      );
    } catch (error) {
      // No match found within timeout
      return null;
    }
  }

  /**
   * Create bot game
   */
  async createBotGame(
    userId: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ): Promise<{ gameId: string; color: 'white' | 'black' }> {
    return this.request<{ gameId: string; color: 'white' | 'black' }>(
      'POST',
      '/api/v1/matchmaking/bot',
      { userId, difficulty }
    );
  }

  /**
   * Create friend challenge
   */
  async createFriendChallenge(
    userId: string,
    friendId: string,
    timeControl: string
  ): Promise<{ gameId: string; challengeCode: string }> {
    return this.request<{ gameId: string; challengeCode: string }>(
      'POST',
      '/api/v1/matchmaking/challenge',
      { userId, friendId, timeControl }
    );
  }

  /**
   * Join friend challenge
   */
  async joinChallenge(
    userId: string,
    challengeCode: string
  ): Promise<{ gameId: string; color: 'white' | 'black' }> {
    return this.request<{ gameId: string; color: 'white' | 'black' }>(
      'POST',
      `/api/v1/matchmaking/challenge/${challengeCode}/join`,
      { userId }
    );
  }
}
