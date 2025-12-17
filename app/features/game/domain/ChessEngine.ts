import { ChessJsAdapter } from '@/core/utils/chess/adapters/chessjs-adapter';
import type { IChessEngine } from './IChessEngine';
import type { GameState } from '@/types/live-game';
import type { MakeMoveParams } from '../repositories/IGameRepository';

/**
 * Chess Engine Implementation
 * 
 * Uses ChessJsAdapter to validate moves and check game state.
 */
export class ChessEngine implements IChessEngine {
  private adapter: ChessJsAdapter;

  constructor() {
    this.adapter = new ChessJsAdapter();
  }

  validateMove(game: GameState, params: MakeMoveParams): boolean {
    try {
      this.adapter.load(game.fen);
      const moveResult = this.adapter.move({
        from: params.from,
        to: params.to,
        promotion: params.promotion?.toLowerCase(),
      });
      return !!moveResult;
    } catch {
      return false;
    }
  }

  isCheckmate(game: GameState): boolean {
    try {
      this.adapter.load(game.fen);
      return this.adapter.isCheckmate();
    } catch {
      return false;
    }
  }

  isStalemate(game: GameState): boolean {
    try {
      this.adapter.load(game.fen);
      return this.adapter.isStalemate();
    } catch {
      return false;
    }
  }

  isDraw(game: GameState): boolean {
    try {
      this.adapter.load(game.fen);
      return this.adapter.isDraw();
    } catch {
      return false;
    }
  }

  getWinner(game: GameState): '1-0' | '0-1' | '1/2-1/2' | null {
    if (!game.result) return null;
    return game.result as '1-0' | '0-1' | '1/2-1/2';
  }
}
