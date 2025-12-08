import type { MoveContext, MoveStrategy, MoveResult } from './types';

export const isRookMove = (ctx: MoveContext) => {
  const piece = ctx.board[ctx.from.rank]?.[ctx.from.file];
  if (!piece) return false;
  if (piece.type !== 'R') return false;
  return ctx.from.file === ctx.to.file || ctx.from.rank === ctx.to.rank;
};

export const strategy: MoveStrategy = {
  isMoveType: isRookMove,
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
