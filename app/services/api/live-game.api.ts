import type { GameState } from '@/types/live-game';
import {DecisionReason} from "@/features/game/types";

export interface ILiveGameApiClient {
  getGame(gameId: string): Promise<GameState>;
  makeMove(gameId: string, from: string, to: string, promotion?: string): Promise<GameState>;
  resign(gameId: string): Promise<GameState>;
  createBotGame(userId: string, difficulty: string, playerColor: 'white' | 'black'): Promise<{ gameId: string }>;

  /**
   * Create a friend game
   */
  createFriendGame(
    creatorId: string,
    timeControl: string,
    playerColor: 'white' | 'black',
    rated?: boolean,
    options?: any
  ): Promise<{ gameId: string; inviteCode: string; rated: boolean; decision_reason?: any }>;

  /**
   * Join a friend game via invite code
   */
  joinFriendGame(userId: string, inviteCode: string): Promise<{ gameId: string }>;

  /**
   * Request a takeback (unrated games only)
   */
  requestTakeback(gameId: string): Promise<GameState>;

  /**
   * Set a custom board position (unrated games only, before start)
   */
  setPosition(gameId: string, fen: string): Promise<GameState>;

  /**
   * Update rated status (only before the game starts)
   */
  updateRatedStatus(gameId: string, rated: boolean): Promise<GameState>;
}

export class LiveGameApiClient implements ILiveGameApiClient {
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
        `API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch current game state
   */
  async getGame(gameId: string): Promise<GameState> {
    return this.request<GameState>('GET', `/v1/games/${gameId}`);
  }

  /**
   * Submit a move
   */
  async makeMove(
    gameId: string,
    from: string,
    to: string,
    promotion?: string
  ): Promise<GameState> {
    return this.request<GameState>('POST', `/v1/games/${gameId}/moves`, {
      from,
      to,
      promotion,
    });
  }

  /**
   * Resign from the game
   */
  async resign(gameId: string): Promise<GameState> {
    return this.request<GameState>('POST', `/v1/games/${gameId}/resign`, {});
  }

  /**
   * Create a bot game
   */
  async createBotGame(
    userId: string,
    difficulty: string,
    playerColor: 'white' | 'black'
  ): Promise<{ gameId: string }> {
    return this.request<{ gameId: string }>('POST', '/v1/games/bot', {
      userId,
      difficulty,
      playerColor,
    });
  }

  /**
   * Create a friend game
   */
  async createFriendGame(
    creatorId: string,
    timeControl: string,
    playerColor: 'white' | 'black',
    rated: boolean = true,
    options?: {
      starting_fen?: string;
      is_odds_game?: boolean;
    }
  ): Promise<{ gameId: string; inviteCode: string; rated: boolean; decision_reason?: DecisionReason }> {
    return this.request<{ gameId: string; inviteCode: string; rated: boolean; decision_reason?: DecisionReason }>('POST', '/v1/games/friend', {
      creatorId,
      timeControl,
      playerColor,
      rated,
      is_local_game: false,
      starting_fen: options?.starting_fen,
      is_odds_game: options?.is_odds_game,
    });
  }

  /**
   * Join a friend game via invite code
   */
  async joinFriendGame(userId: string, inviteCode: string): Promise<{ gameId: string }> {
    return this.request<{ gameId: string }>('POST', '/v1/games/friend/join', {
      userId,
      inviteCode,
    });
  }

  /**
   * Request a takeback (unrated games only)
   */
  async requestTakeback(gameId: string): Promise<GameState> {
    return this.request<GameState>('POST', `/v1/games/${gameId}/takeback`, {});
  }

  /**
   * Set custom board position (unrated games only, before start)
   */
  async setPosition(gameId: string, fen: string): Promise<GameState> {
    return this.request<GameState>('POST', `/v1/games/${gameId}/position`, { fen });
  }

  /**
   * Update rated status (only before game starts)
   */
  async updateRatedStatus(gameId: string, rated: boolean): Promise<GameState> {
    return this.request<GameState>('PATCH', `/v1/games/${gameId}/rated`, { rated });
  }
}