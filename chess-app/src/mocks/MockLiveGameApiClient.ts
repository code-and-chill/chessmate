/**
 * Mock implementation of LiveGameApiClient
 * Provides offline live game data for development and testing
 */

import type { GameState } from '../types/GameState';
import { LiveGameApiClient } from '../api/liveGameClient';
import { generateMockGameState } from './mockData';

export class MockLiveGameApiClient extends LiveGameApiClient {
  private mockGames: Map<string, GameState> = new Map();

  constructor(
    baseUrl: string = 'http://mock-api',
    token: string = 'mock-token',
    private simulateDelay: number = 500
  ) {
    super(baseUrl, token);
    this.initializeMockGames();
  }

  /**
   * Initialize mock game store
   */
  private initializeMockGames(): void {
    const game1 = generateMockGameState();
    const game2 = generateMockGameState();
    this.mockGames.set('game-live-1', game1);
    this.mockGames.set('game-live-2', game2);
  }

  /**
   * Simulate network delay
   */
  private async delay(): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, this.simulateDelay + Math.random() * 200)
    );
  }

  /**
   * Get game by ID
   */
  async getGame(gameId: string): Promise<GameState> {
    await this.delay();
    const game = this.mockGames.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }
    return game;
  }

  /**
   * Make a move in a game
   */
  async makeMove(gameId: string): Promise<GameState> {
    await this.delay();
    const game = this.mockGames.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    const updatedGame: GameState = {
      ...game,
      turn: game.turn === 'white' ? 'black' : 'white',
    };

    this.mockGames.set(gameId, updatedGame);
    return updatedGame;
  }

  /**
   * Resign from a game
   */
  async resign(gameId: string): Promise<GameState> {
    await this.delay();
    const game = this.mockGames.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    const updatedGame: GameState = {
      ...game,
      status: 'draw',
    };

    this.mockGames.set(gameId, updatedGame);
    return updatedGame;
  }
}
