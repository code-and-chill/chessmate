import type { ILiveGameApiClient } from '@/services/api';
import type {
  IGameRepository,
  MakeMoveParams,
  CreateBotGameParams,
  CreateFriendGameParams,
  JoinFriendGameParams,
} from './IGameRepository';
import type { GameState } from '@/types/live-game';

/**
 * Game Repository Implementation
 * 
 * Wraps ILiveGameApiClient to provide repository abstraction.
 * Handles data transformation from API models to domain models.
 */
export class GameRepository implements IGameRepository {
  constructor(private apiClient: ILiveGameApiClient) {}

  async getGame(gameId: string): Promise<GameState> {
    const response = await this.apiClient.getGame(gameId);
    return this.mapApiResponseToGameState(response);
  }

  async makeMove(params: MakeMoveParams): Promise<GameState> {
    const response = await this.apiClient.makeMove(
      params.gameId,
      params.from,
      params.to,
      params.promotion
    );
    return this.mapApiResponseToGameState(response);
  }

  async resign(gameId: string): Promise<GameState> {
    const response = await this.apiClient.resign(gameId);
    return this.mapApiResponseToGameState(response);
  }

  async createBotGame(params: CreateBotGameParams): Promise<{ gameId: string }> {
    return this.apiClient.createBotGame(
      params.userId,
      params.difficulty,
      params.playerColor
    );
  }

  async createFriendGame(
    params: CreateFriendGameParams
  ): Promise<{
    gameId: string;
    inviteCode: string;
    rated: boolean;
    decision_reason?: any;
  }> {
    return this.apiClient.createFriendGame(
      params.creatorId,
      params.timeControl,
      params.playerColor,
      params.rated,
      params.options
    );
  }

  async joinFriendGame(params: JoinFriendGameParams): Promise<{ gameId: string }> {
    return this.apiClient.joinFriendGame(params.userId, params.inviteCode);
  }

  async requestTakeback(gameId: string): Promise<GameState> {
    const response = await this.apiClient.requestTakeback(gameId);
    return this.mapApiResponseToGameState(response);
  }

  async setPosition(gameId: string, fen: string): Promise<GameState> {
    const response = await this.apiClient.setPosition(gameId, fen);
    return this.mapApiResponseToGameState(response);
  }

  async updateRatedStatus(gameId: string, rated: boolean): Promise<GameState> {
    const response = await this.apiClient.updateRatedStatus(gameId, rated);
    return this.mapApiResponseToGameState(response);
  }

  /**
   * Maps API response to domain model
   * Handles any necessary data transformation
   */
  private mapApiResponseToGameState(apiResponse: GameState): GameState {
    // API response should already be in the correct format
    // This method exists for future transformation needs
    // (e.g., if API response format changes)
    return apiResponse;
  }
}
