/**
 * Services Layer - API Clients
 */

// Re-export mock clients for consumers that import from '@/services/api' (explicit per-file re-exports)
export { MockAuthApiClient } from './auth.api.mock';
export { MockAccountApiClient } from './account.api.mock';
export { MockRatingApiClient } from './rating.api.mock';
export { MockMatchmakingApiClient } from './matchmaking.api.mock';
export { MockLearningApiClient } from './learning.api.mock';
export { MockSocialApiClient } from './social.api.mock';
export { MockLiveGameApiClient } from './live-game.api.mock';
export { MockPuzzleApiClient } from './puzzle.api.mock';
export { MockGameApiClient } from './game.api.mock';
export { MockPieceThemeApiClient } from './piece-theme.api.mock';
export { MockEngineApiClient } from './engine.api.mock';

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
export { EngineApiClient } from './engine.api';

// Engine API Types
export type {
  Candidate,
  EvaluatePositionRequest,
  EvaluatePositionResponse,
  HealthResponse,
  IEngineApiClient,
} from './engine.api';
