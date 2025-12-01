/**
 * Services Layer - API Clients
 * 
 * Centralized API client exports for all backend services.
 * Each client follows the naming convention: {service}.api.ts
 * 
 * @example
 * ```tsx
 * import { GameApiClient, PuzzleApiClient } from '@/services/api';
 * ```
 */

// API Clients
export { PlayApiClient as GameApiClient } from './game.api';
export { LiveGameApiClient } from './live-game.api';
export { PuzzleApiClient } from './puzzle.api';
export { AccountApiClient } from './account.api';
export { MatchmakingApiClient } from './matchmaking.api';
export { RatingApiClient } from './rating.api';

// Types (re-export from API clients)
export type { CreateGameRequest, JoinGameRequest } from './game.api';
export type { PuzzleAttempt, PuzzleAttemptResponse } from './puzzle.api';

// Mock clients for testing
export { 
  MockAccountApiClient, 
  MockRatingApiClient, 
  MockMatchmakingApiClient 
} from './mock-clients';

// API Client instances (using mock for development)
import { MockAccountApiClient, MockRatingApiClient } from './mock-clients';
export const accountApi = new MockAccountApiClient();
export const ratingApi = new MockRatingApiClient();

// TODO: Migrate to this structure:
// export * from './client';
// export * from './game.api';
// export * from './puzzle.api';
// export * from './account.api';
// export * from './rating.api';
// export * from './matchmaking.api';
