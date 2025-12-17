import type { IMatchmakingApiClient } from '@/services/api';
import type {
  IMatchmakingRepository,
  JoinQueueParams,
  PollForMatchParams,
  CreateBotGameParams,
  CreateFriendChallengeParams,
  JoinChallengeParams,
} from './IMatchmakingRepository';

/**
 * Matchmaking Repository Implementation
 * 
 * Wraps IMatchmakingApiClient to provide repository abstraction.
 */
export class MatchmakingRepository implements IMatchmakingRepository {
  constructor(private apiClient: IMatchmakingApiClient) {}

  async joinQueue(params: JoinQueueParams) {
    return this.apiClient.joinQueue(params.request);
  }

  async leaveQueue(userId: string) {
    return this.apiClient.leaveQueue(userId);
  }

  async getQueueStatus(userId: string) {
    return this.apiClient.getQueueStatus(userId);
  }

  async pollForMatch(params: PollForMatchParams) {
    return this.apiClient.pollForMatch(params.userId, params.timeout);
  }

  async createBotGame(params: CreateBotGameParams) {
    return this.apiClient.createBotGame(params.userId, params.difficulty);
  }

  async createFriendChallenge(params: CreateFriendChallengeParams) {
    return this.apiClient.createFriendChallenge(
      params.userId,
      params.friendId,
      params.timeControl
    );
  }

  async joinChallenge(params: JoinChallengeParams) {
    return this.apiClient.joinChallenge(params.userId, params.challengeCode);
  }
}
