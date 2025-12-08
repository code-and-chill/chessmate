import type { MoveContext, MoveStrategy, MoveResult } from './types';

export const isPawnMove = (ctx: MoveContext) => {
  const piece = ctx.board[ctx.from.rank]?.[ctx.from.file];
  if (!piece) return false;
  if (piece.type !== 'P') return false;
  const df = Math.abs(ctx.from.file - ctx.to.file);
  const dr = ctx.to.rank - ctx.from.rank;
  const dir = piece.color === 'w' ? 1 : -1;
  // Single forward
  if (df === 0 && dr === dir) return true;
  // Double forward from starting rank
  if (df === 0 && dr === 2 * dir) return true;
  // Capture
  if (df === 1 && dr === dir) return true;
  return false;
};

export const strategy: MoveStrategy = {
  isMoveType: isPawnMove,
  apply: (ctx: MoveContext): MoveResult | null => {
    const piece = ctx.board[ctx.from.rank][ctx.from.file];
    if (!piece) return null;

    const dir = piece.color === 'w' ? 1 : -1;
    const df = Math.abs(ctx.to.file - ctx.from.file);
    const dr = ctx.to.rank - ctx.from.rank;
    let didCapture = false;

    // En-passant capture
    if (df === 1 && dr === dir && !ctx.board[ctx.to.rank][ctx.to.file] && ctx.enPassant) {
      const epSquare = ctx.enPassant; // algebraic
      if (epSquare) {
        // epSquare might be like 'e3'
        const epFile = epSquare.charCodeAt(0) - 97;
        const epRank = parseInt(epSquare[1], 10) - 1;
        if (epFile === ctx.to.file && epRank === ctx.to.rank) {
          const capturedRank = ctx.to.rank - dir;
          ctx.board[capturedRank][ctx.to.file] = null;
          didCapture = true;
        }
      }
    }

    // Normal capture
    if (df === 1 && dr === dir && ctx.board[ctx.to.rank][ctx.to.file]) {
      didCapture = true;
    }

    // Move the pawn
    let placed = piece;
    if (ctx.promotion) {
      placed = { type: ctx.promotion as any, color: piece.color } as any;
    }

    ctx.board[ctx.to.rank][ctx.to.file] = placed;
    ctx.board[ctx.from.rank][ctx.from.file] = null;

    // If double-step, set an en-passant target
    let enPassantTarget: string | null = null;
    if (df === 0 && Math.abs(dr) === 2) {
      const epRank = ctx.from.rank + dir;
      enPassantTarget = String.fromCharCode(97 + ctx.from.file) + (epRank + 1);
    }

    return { didCapture, enPassant: enPassantTarget };
  },
};
