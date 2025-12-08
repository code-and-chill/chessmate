import type {Board, Color, Move} from './types';

export interface IEngine {
  // initialize engine with a FEN
  load(fen: string): void;
  // current FEN
  fen(): string;
  // board in EngineBoard shape
  board(): Board;
  // verbose moves from a square (algebraic strings)
  moves(fromSquare?: string): { from: string; to: string; san?: string; promotion?: string | null }[];
  // is king of color in check
  inCheck(color: Color): boolean;
  // apply a move
  move(move: { from: string; to: string; promotion?: string | null }): any;
  // high-level helpers mapping to Move[] used by move-service
  getLegalMoves(board: Board, from: { file: number; rank: number }, options?: any): Move[];
  isValidMove(board: Board, from: { file: number; rank: number }, to: { file: number; rank: number }, options?: any): boolean;
}
