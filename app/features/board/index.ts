/**
 * Board Feature Public API
 * 
 * This is the only import path external modules should use when consuming
 * the board feature. All components, hooks, types, and utilities are 
 * exported through this barrel file.
 * 
 * @example
 * ```tsx
 * import { ChessBoard, type ChessBoardProps } from '@/features/board';
 * ```
 */

// Components
/**
 * Board Feature - Component Exports
 * Exports for chess board components and play screen
 */

export { ChessBoard } from './components/ChessBoard';
export { PlayScreen } from './screens/PlayScreen';
export type { PlayScreenProps } from './screens/PlayScreen';

// Types
export type { 
  PieceKey, 
  PieceSet,
  PieceProps 
} from './types/pieces';
export { 
  parsePieceKey, 
  buildPieceKey, 
  getPieceName, 
  ALL_PIECE_KEYS 
} from './types/pieces';

// Component prop types (for advanced usage)
export type { ChessBoardProps } from './components/ChessBoard';
export type { Color } from '@/core/utils/chess';

// Registry & utilities
export { pieceSets, getPieceSetInfo, getAvailableThemes, isThemeAvailable } from './config/pieceSetRegistry';
export type { PieceTheme } from './types/pieces';
