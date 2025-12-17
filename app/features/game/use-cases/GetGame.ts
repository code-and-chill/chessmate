import type { IGameRepository } from '../repositories/IGameRepository';
import type { GameState } from '@/types/live-game';

export class GameNotFoundError extends Error {
  constructor(gameId: string) {
    super(`Game ${gameId} not found`);
    this.name = 'GameNotFoundError';
  }
}

/**
 * GetGame Use Case
 * 
 * Fetches a game by ID.
 * 
 * Business rules:
 * - Game must exist
 */
export class GetGameUseCase {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string): Promise<GameState> {
    try {
      return await this.gameRepository.getGame(gameId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new GameNotFoundError(gameId);
      }
      throw error;
    }
  }
}
