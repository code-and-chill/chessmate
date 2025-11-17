/**
 * Mock implementation of PlayApiClient
 * Provides offline game creation and joining for development and testing
 */

import type { Game } from '../types/game';
import type { GameState } from '../types/GameState';
import { PlayApiClient } from '../api/playApi';
import { generateMockGame, generateMockGameState } from './mockData';

export class MockPlayApiClient extends PlayApiClient {
  private mockGames: Map<string, Game> = new Map();

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
    const games = [
      generateMockGame('game-play-1'),
      generateMockGame('game-play-2'),
    ];
    for (const game of games) {
      this.mockGames.set(game.id, game);
    }
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
   * Create a new game
   */
  async createGame(): Promise<GameState> {
    await this.delay();
    return generateMockGameState();
  }

  /**
   * Join an existing game
   */
  async joinGame(gameId: string): Promise<GameState> {
    await this.delay();
    const game = this.mockGames.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }
    return generateMockGameState();
  }

  /**
   * Get game by ID
   */
  async getGameById(gameId: string): Promise<GameState> {
    await this.delay();
    const game = this.mockGames.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }
    return generateMockGameState();
  }

  /**
   * Get recent games
   */
  async getRecentGames(_userId: string, limit: number = 10): Promise<GameState[]> {
    await this.delay();
    return Array(Math.min(limit, 5))
      .fill(null)
      .map(() => generateMockGameState());
  }

  /**
   * Get active games for user
   */
  async getActiveGamesForUser(_userId: string): Promise<GameState[]> {
    await this.delay();
    return [generateMockGameState()];
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

    const updatedGame: Game = {
      ...game,
      moves: [...(game.moves || []), 'e2e4'],
    };

    this.mockGames.set(gameId, updatedGame);
    return generateMockGameState();
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

    const updatedGame: Game = {
      ...game,
      status: 'completed',
      winner: game.player1,
    };

    this.mockGames.set(gameId, updatedGame);
    return generateMockGameState();
  }
}
