import type { GameState } from '@/types/live-game';
import type { MakeMoveParams } from '../repositories/IGameRepository';

/**
 * Chess Engine Interface for Use Cases
 * 
 * Provides chess rule validation and game state analysis.
 * This interface abstracts the chess engine implementation.
 */
export interface IChessEngine {
  /**
   * Validate if a move is legal for the given game state
   */
  validateMove(game: GameState, params: MakeMoveParams): boolean;

  /**
   * Check if the game is in checkmate
   */
  isCheckmate(game: GameState): boolean;

  /**
   * Check if the game is in stalemate
   */
  isStalemate(game: GameState): boolean;

  /**
   * Check if the game is a draw
   */
  isDraw(game: GameState): boolean;

  /**
   * Get the winner if the game has ended
   */
  getWinner(game: GameState): '1-0' | '0-1' | '1/2-1/2' | null;
}
