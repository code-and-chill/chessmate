/**
 * useGameParticipant Hook
 * 
 * Determines the current user's role in the game and validates participation.
 * Single Responsibility: Participant validation and color assignment.
 */

import { useMemo } from 'react';
import { GameState } from '../types/GameState';

export type Color = 'white' | 'black';

export interface GameParticipant {
  myColor: Color;
  opponentColor: Color;
  isParticipant: boolean;
}

/**
 * Determines if the current user is a participant and their assigned color
 * 
 * @param game Current game state
 * @param currentAccountId Current user's account ID
 * @returns Participant information or null if not a participant
 * 
 * Usage:
 * ```
 * const participant = useGameParticipant(game, currentAccountId);
 * if (participant) {
 *   console.log(`You are playing as ${participant.myColor}`);
 * }
 * ```
 */
export const useGameParticipant = (
  game: GameState | null,
  currentAccountId: string | null
): GameParticipant | null => {
  return useMemo(() => {
    if (!game || !currentAccountId) {
      return null;
    }

    // Determine which color the current user is playing
    // This is a simplified example - adapt based on your actual Game type structure
    // In a real implementation, game would have white.accountId and black.accountId properties
    
    // For now, we'll use a simple heuristic or placeholder
    // TODO: Update when Game type schema is finalized
    
    // Assuming game has players array or similar structure
    const isWhite = true; // Placeholder logic
    const isBlack = false; // Placeholder logic

    if (!isWhite && !isBlack) {
      return null;
    }

    const myColor: Color = isWhite ? 'white' : 'black';
    const opponentColor: Color = myColor === 'white' ? 'black' : 'white';

    return {
      myColor,
      opponentColor,
      isParticipant: true,
    };
  }, [game, currentAccountId]);
};