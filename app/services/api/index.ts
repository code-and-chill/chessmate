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
export { AuthApiClient } from './auth.api';
export { PlayApiClient as GameApiClient } from './game.api';
export { LiveGameApiClient } from './live-game.api';
export { PuzzleApiClient } from './puzzle.api';
export { AccountApiClient } from './account.api';
export { MatchmakingApiClient } from './matchmaking.api';
export { RatingApiClient } from './rating.api';
export { LearningApiClient } from './learning.api';
export { SocialApiClient } from './social.api';

// Types (re-export from API clients)
export type { AuthResponse, LoginRequest, RegisterRequest } from './auth.api';
export type { CreateGameRequest, JoinGameRequest } from './game.api';
export type { PuzzleAttempt, PuzzleAttemptResponse } from './puzzle.api';
export type { 
  Lesson, 
  LessonContent, 
  Quiz, 
  QuizQuestion, 
  LessonProgress, 
  LearningStats, 
  QuizSubmission 
} from './learning.api';

// Mock clients for testing
export { 
  MockAuthApiClient,
  MockAccountApiClient, 
  MockRatingApiClient, 
  MockMatchmakingApiClient,
  MockLearningApiClient,
  MockSocialApiClient,
  MockLiveGameApiClient,
  MockPuzzleApiClient,
  MockPlayApiClient
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
