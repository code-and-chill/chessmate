import type { IGameRepository } from '../repositories/IGameRepository';
import type { GameState } from '@/types/live-game';

/**
 * FetchNowPlaying Use Case
 * 
 * Fetches user's currently active games.
 * 
 * Note: This use case will need to be implemented when the API
 * provides an endpoint for fetching active games.
 * Currently, this is a placeholder for future implementation.
 */
export class FetchNowPlayingUseCase {
  constructor(private gameRepository: IGameRepository) {}

  async execute(userId: string): Promise<GameState[]> {
    // TODO: Implement when API provides getActiveGames endpoint
    // For now, return empty array
    // This will be implemented when the backend adds this endpoint
    return [];
  }
}
