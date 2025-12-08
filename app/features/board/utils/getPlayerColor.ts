import type { GameParticipant } from '@/features/game/hooks/useGameParticipant';

export type PieceColorShort = 'w' | 'b';

export function getPlayerColor(participant: GameParticipant | null | undefined): PieceColorShort {
  if (!participant) return 'w';
  return participant.myColor === 'white' ? 'w' : 'b';
}

