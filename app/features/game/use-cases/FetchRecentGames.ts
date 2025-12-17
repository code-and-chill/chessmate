import type { IGameRepository } from '../repositories/IGameRepository';
import type { GameState } from '@/types/live-game';

export interface FetchRecentGamesParams {
  userId: string;
  limit?: number;
}

/**
 * FetchRecentGames Use Case
 * 
 * Fetches user's recently played games.
 * 
 * Note: This use case will need to be implemented when the API
 * provides an endpoint for fetching recent games.
 * Currently, this is a placeholder for future implementation.
 */
export class FetchRecentGamesUseCase {
  constructor(private gameRepository: IGameRepository) {}

  async execute(params: FetchRecentGamesParams): Promise<GameState[]> {
    // TODO: Implement when API provides getRecentGames endpoint
    // For now, return empty array
    // This will be implemented when the backend adds this endpoint
    return [];
  }
}
