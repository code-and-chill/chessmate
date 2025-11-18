/**
 * Core State Management
 * Zustand stores for global application state
 */

// Stores
export { useAuthStore } from './auth.store';
export type { AuthState, User } from './auth.store';

export { useGameStore } from './game.store';
export type {
  GameState,
  GameStatus,
  PlayerColor,
  Move,
  GamePlayer,
} from './game.store';

export { usePuzzleStore } from './puzzle.store';
export type {
  PuzzleState,
  Puzzle,
  PuzzleAttempt,
} from './puzzle.store';
