import {Board} from "@/core/utils/chess";

export type Square = { file: number; rank: number };

export type Move = { from: Square; to: Square; promotion?: string | null };

export type MoveContext = {
  board: Board;
  from: Square;
  to: Square;
  sideToMove: 'w' | 'b';
  enPassant?: string | null;
  castling?: string | null;
  promotion?: string | null;
};

export type MoveResult = {
  didCapture?: boolean;
  enPassant?: string | null; // en-passant target square to set after move
  // castling field not needed; callers update castling rights separately
};

export type MoveStrategy = {
  isMoveType: (ctx: MoveContext) => boolean;
  apply?: (ctx: MoveContext) => MoveResult | null; // mutate board and return metadata
};
