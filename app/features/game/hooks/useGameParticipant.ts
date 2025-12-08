/**
 * useGameParticipant Hook
 * 
 * Determines the current user's role in the game and validates participation.
 * Single Responsibility: Participant validation and color assignment.
 */

import { useMemo } from 'react';
import { GameState } from '../types/GameState';
import { useAuth } from '@/contexts/AuthContext';
import { getGameParticipant as pureGetGameParticipant } from '../utils/getGameParticipant';

export type Color = 'white' | 'black';

export interface GameParticipant {
  myColor: Color;
  opponentColor: Color;
  isParticipant: boolean;
}

/**
 * Pure helper that determines participant info from game state and identity.
 * Exported separately to allow easy unit testing without React hooks.
 */
// Re-export pure helper for backwards compatibility
export { pureGetGameParticipant as getGameParticipant };

export const useGameParticipant = (
  game: GameState | null,
  currentAccountId: string | null
): GameParticipant | null => {
  const auth = useAuth();

  return useMemo(() => pureGetGameParticipant(game, currentAccountId, auth?.user ?? null), [
    game,
    currentAccountId,
    auth?.user,
  ]);
};