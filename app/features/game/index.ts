/**
 * Game Feature Public API
 * 
 * This is the only import path external modules should use when consuming
 * the game feature. All components, hooks, types, and utilities are 
 * exported through this barrel file.
 * 
 * @example
 * ```tsx
 * import { PlayerPanel, MoveList, GameActions, type GameState } from '@/features/game';
 * ```
 */

// Components
export { PlayerPanel } from './components/PlayerPanel';
export { MoveList } from './components/MoveList';
export { GameActions } from './components/GameActions';

// Types
export type {
  Color,
  GameStatus,
  GameResult,
  Move,
  PlayerInfo,
  GameState,
} from './types/game.types';

// Component prop types (for advanced usage)
export type { PlayerPanelProps } from './components/PlayerPanel';
export type { MoveListProps } from './components/MoveList';
export type { GameActionsProps } from './components/GameActions';

// Hooks (when implemented)
// export { useGameState } from './hooks/useGameState';
// export { useGameTimer } from './hooks/useGameTimer';
// export { useGameActions } from './hooks/useGameActions';

// State (when implemented)
// export { gameSlice, gameActions } from './state/gameSlice';
