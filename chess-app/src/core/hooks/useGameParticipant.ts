/**
 * useGameParticipant Hook
 * 
 * Determines the current user's role in the game and validates participation.
 * Single Responsibility: Participant validation and color assignment.
 */

import { GameState, Color } from '../../core/models/game';

export interface GameParticipant {
  myColor: Color;
  opponentColor: Color;
  isParticipant: boolean;
}

export const useGameParticipant = (
  game: GameState | null,
  currentAccountId: string | null
): GameParticipant | null => {
  if (!game || !currentAccountId) {
    return null;
  }

  const myColor =
    game.white.accountId === currentAccountId
      ? 'w'
      : game.black.accountId === currentAccountId
      ? 'b'
      : null;

  if (!myColor) {
    return null;
  }

  return {
    myColor,
    opponentColor: myColor === 'w' ? 'b' : 'w',
    isParticipant: true,
  };
};
