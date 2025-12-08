import { ChessJsAdapter } from './adapters/chessjs-adapter';
import type { IEngine } from './engine-interface';
import type {Board, Color, Move} from './types';
import {boardToFen} from "@/core/utils/chess/logic/parsing";

export class ChessJsEngine implements IEngine {
  private adapter: ChessJsAdapter;

  constructor(fen?: string) {
    this.adapter = new ChessJsAdapter(fen);
  }

  load(fen: string) {
    this.adapter.load(fen);
  }

  fen(): string {
    return this.adapter.fen();
  }

  board(): Board {
    return this.adapter.board();
  }

  moves(fromSquare?: string) {
    return this.adapter.moves(fromSquare);
  }

  inCheck(color: Color): boolean {
    return this.adapter.inCheck(color);
  }

  move(move: { from: string; to: string; promotion?: string | null }) {
    return this.adapter.move(move);
  }

  getLegalMoves(board: Board, from: { file: number; rank: number }, options?: any): Move[] {
    const fen = boardToFen(board, options?.sideToMove ?? 'w', options?.castlingRights ?? '-', options?.enPassantTarget ?? '-', options?.halfmoveClock ?? 0, options?.fullmoveNumber ?? 1);
    this.adapter.load(fen);
    const fromAlg = String.fromCharCode(97 + from.file) + (from.rank + 1);
    const raw = this.adapter.moves(fromAlg);
    return raw.map(m => ({ from: { file: m.from.charCodeAt(0) - 97, rank: parseInt(m.from[1], 10) - 1 }, to: { file: m.to.charCodeAt(0) - 97, rank: parseInt(m.to[1], 10) - 1 }, promotion: m.promotion ?? null } as Move));
  }

  isValidMove(board: Board, from: { file: number; rank: number }, to: { file: number; rank: number }, options?: any): boolean {
    const fen = boardToFen(board, options?.sideToMove ?? 'w', options?.castlingRights ?? '-', options?.enPassantTarget ?? '-', options?.halfmoveClock ?? 0, options?.fullmoveNumber ?? 1);
    this.adapter.load(fen);
    const fromAlg = String.fromCharCode(97 + from.file) + (from.rank + 1);
    const raw = this.adapter.moves(fromAlg);
    return raw.some(m => m.to.charCodeAt(0) - 97 === to.file && parseInt(m.to[1], 10) - 1 === to.rank);
  }
}
