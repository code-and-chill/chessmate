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
export { ChessBoard } from './components/ChessBoard';

// Types
export type { BoardProps, Square, Piece } from './types/board.types';

// Component prop types (for advanced usage)
export type { ChessBoardProps, Color } from './components/ChessBoard';
