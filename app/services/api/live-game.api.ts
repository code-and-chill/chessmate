/**
 * Live game API client - handles communication with live-game-api.
 */

import type { LiveGameMove } from './types';
import type { WebSocketMessage } from './websocket';
import { apiClient } from './client';
import { GameState } from '../../features/game/types/GameState';

export class LiveGameApiClient {
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
    playerColor: 'white' | 'black'
  ): Promise<{ gameId: string; inviteCode: string }> {
    return this.request<{ gameId: string; inviteCode: string }>('POST', '/v1/games/friend', {
      creatorId,
      timeControl,
      playerColor,
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
}