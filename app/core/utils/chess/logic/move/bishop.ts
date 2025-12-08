import type { MoveContext, MoveStrategy, MoveResult } from './types';

export const isBishopMove = (ctx: MoveContext) => {
  const piece = ctx.board[ctx.from.rank]?.[ctx.from.file];
  if (!piece) return false;
  if (piece.type !== 'B') return false;
  return Math.abs(ctx.from.file - ctx.to.file) === Math.abs(ctx.from.rank - ctx.to.rank);
};

export const strategy: MoveStrategy = {
  isMoveType: isBishopMove,
  apply: (ctx: MoveContext): MoveResult | null => {
    const piece = ctx.board[ctx.from.rank]?.[ctx.from.file];
    if (!piece) return null;

    const target = ctx.board[ctx.to.rank]?.[ctx.to.file];
    const didCapture = Boolean(target);

    // Move piece
    ctx.board[ctx.to.rank][ctx.to.file] = piece;
    ctx.board[ctx.from.rank][ctx.from.file] = null;

    return { didCapture };
  },
};
