/**
 * Services Layer - API Clients
 */

// Import mock clients used to create local instances
import { MockAccountApiClient, MockRatingApiClient } from './mock-clients';
// Re-export mock clients for consumers that import from '@/services/api'
export { MockAuthApiClient, MockAccountApiClient, MockRatingApiClient, MockMatchmakingApiClient, MockLearningApiClient, MockSocialApiClient, MockLiveGameApiClient, MockPuzzleApiClient, MockPlayApiClient } from './mock-clients';

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
export { PieceThemeApiClient, PIECE_THEME_LABELS } from './piece-theme.api';

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

// API Client instances (using mock for development)
export const accountApi = new MockAccountApiClient();
export const ratingApi = new MockRatingApiClient();

// TODO: Migrate to this structure:
// export * from './client';
// export * from './game.api';
// export * from './puzzle.api';
// export * from './account.api';
// export * from './rating.api';
// export * from './matchmaking.api';
