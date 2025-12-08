import type { MoveContext, MoveStrategy, MoveResult } from './types';

export const isQueenMove = (ctx: MoveContext) => {
  const piece = ctx.board[ctx.from.rank]?.[ctx.from.file];
  if (!piece) return false;
  if (piece.type !== 'Q') return false;
  const df = Math.abs(ctx.from.file - ctx.to.file);
  const dr = Math.abs(ctx.from.rank - ctx.to.rank);
  return df === dr || ctx.from.file === ctx.to.file || ctx.from.rank === ctx.to.rank;
};

export const strategy: MoveStrategy = {
  isMoveType: isQueenMove,
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
