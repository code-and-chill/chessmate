import { GameState, TimeControl } from '../types/game';

export interface CreateGameRequest {
  timeControl: TimeControl;
  colorPreference?: 'white' | 'black' | 'random';
  rated?: boolean;
  opponentAccountId?: string;
}

export interface JoinGameRequest {
  colorPreference?: 'white' | 'black' | 'random';
}

export class PlayApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
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
        Authorization: `Bearer ${this.token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `Play API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Create a new game challenge
   */
  async createGame(request: CreateGameRequest): Promise<GameState> {
    return this.request<GameState>('POST', '/v1/games', {
      time_control: request.timeControl,
      color_preference: request.colorPreference || 'random',
      rated: request.rated !== false,
      opponent_account_id: request.opponentAccountId,
    });
  }

  /**
   * Join an existing game
   */
  async joinGame(
    gameId: string,
    request: JoinGameRequest = {}
  ): Promise<GameState> {
    return this.request<GameState>('POST', `/v1/games/${gameId}/join`, {
      color_preference: request.colorPreference || 'random',
    });
  }

  /**
   * Get game by ID
   */
  async getGameById(gameId: string): Promise<GameState> {
    return this.request<GameState>('GET', `/v1/games/${gameId}`);
  }

  /**
   * Get recent games for user
   */
  async getRecentGames(userId: string, limit: number = 10): Promise<GameState[]> {
    const response = await this.request<any>(
      'GET',
      `/v1/games?status=ended&limit=${limit}`
    );
    return response.games || [];
  }

  /**
   * Get active games for user
   */
  async getActiveGamesForUser(userId: string): Promise<GameState[]> {
    const response = await this.request<any>(
      'GET',
      `/v1/games?status=in_progress`
    );
    return response.games || [];
  }

  /**
   * Make a move in a game
   */
  async makeMove(
    gameId: string,
    from: string,
    to: string,
    promotion?: string
  ): Promise<GameState> {
    return this.request<GameState>('POST', `/v1/games/${gameId}/moves`, {
      from_square: from,
      to_square: to,
      promotion,
    });
  }

  /**
   * Resign from a game
   */
  async resign(gameId: string): Promise<GameState> {
    return this.request<GameState>('POST', `/v1/games/${gameId}/resign`, {});
  }
}