/**
 * useGameInteractivity Hook
 * 
 * Determines if the current player can interact with the board.
 * Single Responsibility: Game interactivity state management.
 */

import { GameState, Color, GameStatus } from '../../core/models/game';

export interface GameInteractivity {
  isInteractive: boolean;
  canMove: boolean;
  reason: 'not_your_turn' | 'game_ended' | 'awaiting_opponent' | 'not_participant' | 'ready' | null;
}

/**
 * Determines if the current player can interact with the board based on game state
 * 
 * @param game Current game state
 * @param myColor Player's color (or null if not a participant)
 * @returns Interactivity information
 */
export const useGameInteractivity = (
  game: GameState | null,
  myColor: Color | null
): GameInteractivity => {
  if (!game || !myColor) {
    return {
      isInteractive: false,
      canMove: false,
      reason: 'not_participant',
    };
  }

  if (game.status !== 'in_progress') {
    return {
      isInteractive: false,
      canMove: false,
      reason: 'game_ended',
    };
  }

  if (game.sideToMove !== myColor) {
    return {
      isInteractive: false,
      canMove: false,
      reason: 'not_your_turn',
    };
  }

  return {
    isInteractive: true,
    canMove: true,
    reason: 'ready',
  };
};
