// Core chess types
export type Color = 'w' | 'b';
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

export interface Piece {
  type: PieceType;
  color: Color;
}

export interface Square {
  file: number;
  rank: number;
}

export type Board = (Piece | null)[][];

export type LastMove = { from: string; to: string };

export type MoveOptions = {
  lastMove?: LastMove | null;
  enPassantTarget?: string | null;
  castlingRights?: string | null;
  promotion?: string | null;
  sideToMove?: Color | null;
};

export type Move = {
  from: Square;
  to: Square;
  promotion?: string | null;
  flags?: string[];
};
