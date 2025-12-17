import type { IGameRepository } from '../repositories/IGameRepository';
import type { CreateBotGameParams, CreateFriendGameParams } from '../repositories/IGameRepository';
import type { GameState } from '@/types/live-game';

export type CreateGameParams = CreateBotGameParams | CreateFriendGameParams;

export class CreateGameError extends Error {
  constructor(message: string = 'Failed to create game') {
    super(message);
    this.name = 'CreateGameError';
  }
}

/**
 * CreateGame Use Case
 * 
 * Creates a new game (bot or friend game).
 * 
 * Business rules:
 * - User must be authenticated
 * - Difficulty must be valid (for bot games)
 * - Time control must be valid (for friend games)
 */
export class CreateGameUseCase {
  constructor(private gameRepository: IGameRepository) {}

  async execute(params: CreateGameParams): Promise<{ gameId: string }> {
    try {
      if ('difficulty' in params) {
        // Bot game
        return await this.gameRepository.createBotGame(params);
      } else {
        // Friend game - returns more info, but we extract gameId
        const result = await this.gameRepository.createFriendGame(params);
        return { gameId: result.gameId };
      }
    } catch (error) {
      throw new CreateGameError(
        error instanceof Error ? error.message : 'Failed to create game'
      );
    }
  }
}
