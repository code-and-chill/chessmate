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
export { Piece } from './components/Piece';
export { BoardAndMovesContainer } from './components/BoardAndMovesContainer';
export type { BoardAndMovesContainerProps } from './components/BoardAndMovesContainer';
export { PlayScreen } from './screens/PlayScreen';
export type { PlayScreenProps } from './screens/PlayScreen';

// Piece set registry
export {
  pieceSets,
  getPieceSetInfo,
  getAvailableThemes,
  isThemeAvailable,
} from './config/pieceSetRegistry';

// Types
export type { BoardProps, Square, Piece } from './types/board.types';
export type { 
  PieceKey, 
  PieceTheme, 
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
export type { ChessBoardProps, Color } from './components/ChessBoard';
