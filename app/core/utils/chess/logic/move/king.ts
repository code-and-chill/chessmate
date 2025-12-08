import type { MoveContext, MoveStrategy, MoveResult } from './types';

export const isKingMove = (ctx: MoveContext) => {
  const piece = ctx.board[ctx.from.rank]?.[ctx.from.file];
  return Boolean(piece && piece.type === 'K');
};

export const isCastleKingside = (ctx: MoveContext) => {
  return Math.abs(ctx.to.file - ctx.from.file) === 2 && ctx.from.rank === ctx.to.rank;
};

export const isCastleQueenside = (ctx: MoveContext) => {
  return Math.abs(ctx.to.file - ctx.from.file) === 2 && ctx.from.rank === ctx.to.rank;
};

export const strategy: MoveStrategy = {
  isMoveType: isKingMove,
  apply: (ctx: MoveContext): MoveResult | null => {
    const moving = ctx.board[ctx.from.rank][ctx.from.file];
    if (!moving) return null;

    const isCastleK = isCastleKingside(ctx);
    const isCastleQ = isCastleQueenside(ctx);

    if (isCastleK) {
      const rRank = ctx.from.rank;
      // move rook from h-file to f-file
      ctx.board[rRank][5] = ctx.board[rRank][7];
      ctx.board[rRank][7] = null;
    } else if (isCastleQ) {
      const rRank = ctx.from.rank;
      // move rook from a-file to d-file
      ctx.board[rRank][3] = ctx.board[rRank][0];
      ctx.board[rRank][0] = null;
    }

    // Move king
    ctx.board[ctx.to.rank][ctx.to.file] = moving;
    ctx.board[ctx.from.rank][ctx.from.file] = null;

    return { didCapture: false };
  },
};
