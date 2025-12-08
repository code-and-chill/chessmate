import type { MoveContext, MoveStrategy, MoveResult } from './types';

export const isKnightMove = (ctx: MoveContext) => {
  const piece = ctx.board[ctx.from.rank]?.[ctx.from.file];
  if (!piece) return false;
  if (piece.type !== 'N') return false;
  const df = Math.abs(ctx.from.file - ctx.to.file);
  const dr = Math.abs(ctx.from.rank - ctx.to.rank);
  return (df === 1 && dr === 2) || (df === 2 && dr === 1);
};

export const strategy: MoveStrategy = {
  isMoveType: isKnightMove,
  apply: (ctx: MoveContext): MoveResult | null => {
    const piece = ctx.board[ctx.from.rank][ctx.from.file];
    if (!piece) return null;
    const target = ctx.board[ctx.to.rank][ctx.to.file];
    const didCapture = Boolean(target);
    ctx.board[ctx.to.rank][ctx.to.file] = piece;
    ctx.board[ctx.from.rank][ctx.from.file] = null;
    return { didCapture };
  },
};
