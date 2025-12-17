import type { MatchmakingRequest, MatchFound, QueueStatus } from '@/types/matchmaking';

export interface JoinQueueParams {
  request: MatchmakingRequest;
}

export interface PollForMatchParams {
  userId: string;
  timeout?: number;
}

export interface CreateBotGameParams {
  userId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface CreateFriendChallengeParams {
  userId: string;
  friendId: string;
  timeControl: string;
}

export interface JoinChallengeParams {
  userId: string;
  challengeCode: string;
}

export interface IMatchmakingRepository {
  /**
   * Join matchmaking queue
   */
  joinQueue(params: JoinQueueParams): Promise<QueueStatus>;

  /**
   * Leave matchmaking queue
   */
  leaveQueue(userId: string): Promise<void>;

  /**
   * Get queue status
   */
  getQueueStatus(userId: string): Promise<QueueStatus>;

  /**
   * Poll for match (long polling)
   */
  pollForMatch(params: PollForMatchParams): Promise<MatchFound | null>;

  /**
   * Create bot game
   */
  createBotGame(params: CreateBotGameParams): Promise<{ gameId: string; color: 'white' | 'black' }>;

  /**
   * Create friend challenge
   */
  createFriendChallenge(params: CreateFriendChallengeParams): Promise<{ gameId: string; challengeCode: string }>;

  /**
   * Join friend challenge
   */
  joinChallenge(params: JoinChallengeParams): Promise<{ gameId: string; color: 'white' | 'black' }>;
}
