/**
 * Board Types
 */

export interface BoardProps {
  fen?: string;
  orientation?: 'white' | 'black';
  onMove?: (move: string) => void;
}

export interface Square {
  file: string;
  rank: number;
  piece?: Piece;
}

export interface Piece {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
}
