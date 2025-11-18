/**
 * Centralized API client exports.
 */

// Real API clients
export { LiveGameApiClient } from './liveGameClient';
export { PuzzleApiClient } from './puzzleApi';
export { PlayApiClient } from './playApi';
export { AccountApiClient } from './accountApi';
export { RatingApiClient } from './ratingApi';
export { MatchmakingApiClient } from './matchmakingApi';

// Mock API clients and data
export { MockAccountApiClient, MockRatingApiClient, MockMatchmakingApiClient } from './mockClients';
export * from './mockData';

// Types
export type { PuzzleAttempt, PuzzleAttemptResponse } from './puzzleApi';
export type { CreateGameRequest, JoinGameRequest } from './playApi';
export type { UserProfile, Friend, FriendRequest } from './accountApi';
export type { RatingHistory, GameStats, LeaderboardEntry, Achievement } from './ratingApi';
export type { MatchmakingRequest, MatchFound, QueueStatus } from './matchmakingApi';