import { getStrategyForPiece } from './index';
import type { MoveContext, MoveStrategy } from './types';

/**
 * Return the MoveStrategy for the piece on ctx. From if the strategy matches the move.
 */
export const detectMoveStrategy = (ctx: MoveContext): MoveStrategy | null => {
  const piece = ctx.board[ctx.from.rank]?.[ctx.from.file];
  if (!piece) return null;
  const strat = getStrategyForPiece(piece.type);
  if (!strat) return null;
  return strat.isMoveType(ctx) ? strat : null;
};

/**
 * Return the piece type char (e.g. 'K','Q','R','B','N','P') for the moving piece, or null.
 */
export const detectPieceType = (ctx: MoveContext): string | null => {
  const piece = ctx.board[ctx.from.rank]?.[ctx.from.file];
  return piece?.type ?? null;
};

/**
 * Quick boolean check whether the provided context corresponds to the given piece type move.
 */
export const isMoveOfType = (ctx: MoveContext, typeChar: string): boolean => {
  const s = getStrategyForPiece(typeChar);
  if (!s) return false;
  return s.isMoveType(ctx);
};

/**
 * If a strategy is detected for the move and it provides an `apply` handler, run it and
 * return the result (or null if none).
 */
export const applyStrategy = (ctx: MoveContext) => {
  const strat = detectMoveStrategy(ctx);
  if (!strat) return null;
  if (typeof strat.apply === 'function') return strat.apply(ctx);
  return null;
};
