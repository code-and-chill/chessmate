import { Chess } from 'chess.js';
import type { Board as EngineBoard, Color } from '../types';

export class ChessJsAdapter {
  private chess: any;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  load(fen: string) {
    this.chess = new Chess(fen);
  }

  reset() {
    this.chess.reset();
  }

  fen(): string {
    return this.chess.fen();
  }

  pgn(): string {
    return this.chess.pgn();
  }

  /**
   * Convert chess.js board() to the project's EngineBoard shape
   */
  board(): EngineBoard {
    // chess.board() returns 8 ranks from 8 -> 1 (rank 8 at index 0)
    const raw = this.chess.board();
    // Our EngineBoard expects board[0] === rank 1, so reverse
    const adapted = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    for (let r = 0; r < raw.length; r++) {
      const rank = raw[r];
      const boardRankIdx = 7 - r; // reverse
      for (let f = 0; f < rank.length; f++) {
        const p = rank[f];
        if (!p) continue;
        adapted[boardRankIdx][f] = {
          type: p.type.toUpperCase(),
          color: p.color === 'w' ? 'w' : 'b',
        } as any;
      }
    }
    return adapted as EngineBoard;
  }

  moves(fromSquare?: string): { from: string; to: string; san?: string; promotion?: string | null }[] {
    const opts: any = { verbose: true };
    if (fromSquare) opts.square = fromSquare;
    const moves = this.chess.moves(opts) as any[];
    return moves.map((m) => ({ from: m.from, to: m.to, san: m.san, promotion: m.promotion ?? null }));
  }

  /**
   * Return verbose history from chess.js. When called with `verbose=true` it returns move objects
   * containing `captured`, `color`, `san`, etc. which the UI uses for captured piece tracking.
   */
  history(opts?: { verbose?: boolean }) {
    const verbose = opts?.verbose ?? false;
    return this.chess.history({ verbose });
  }

  /**
   * Checks if the king of `color` is in check. This is reliable when asking about the side to move
   * (i.e. chess.turn() === color). For other colors this will only return true if that color also
   * happens to be the side to move in the current FEN. The app currently queries isKingInCheck for
   * the player side and sideToMove, so this is sufficient for the initial integration.
   */
  inCheck(color: Color): boolean {
    const tmp = new Chess(this.chess.fen());
    return tmp.turn() === color && tmp.inCheck();
  }

  /**
   * Return whether the side to move is currently in check.
   * Matches chess.js `inCheck()` behaviour used by some callers.
   */
  isCheck(): boolean {
    const tmp = new Chess(this.chess.fen());
    return tmp.inCheck();
  }

  isCheckmate() {
    return this.chess.isCheckmate();
  }

  isStalemate() {
    return this.chess.isStalemate();
  }

  isDraw() {
    return this.chess.isDraw();
  }

  isThreefoldRepetition() {
    return this.chess.isThreefoldRepetition();
  }

  isInsufficientMaterial() {
    return this.chess.isInsufficientMaterial();
  }

  turn() {
    return this.chess.turn();
  }

  move({ from, to, promotion }: { from: string; to: string; promotion?: string | null }) {
    return this.chess.move({ from, to, promotion: promotion ?? undefined });
  }
}
