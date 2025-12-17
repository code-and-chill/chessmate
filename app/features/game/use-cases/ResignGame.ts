import type { IGameRepository } from '../repositories/IGameRepository';
import type { GameState } from '@/types/live-game';
import { GameNotActiveError } from './MakeMove';

/**
 * ResignGame Use Case
 * 
 * Resigns from a game.
 * 
 * Business rules:
 * - Game must be in progress
 */
export class ResignGameUseCase {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string): Promise<GameState> {
    // Check game is active
    const game = await this.gameRepository.getGame(gameId);
    if (game.status !== 'in_progress') {
      throw new GameNotActiveError(
        `Game ${gameId} is not active (status: ${game.status})`
      );
    }

    return this.gameRepository.resign(gameId);
  }
}
