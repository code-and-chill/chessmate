import { GameState } from '../types/GameState';

export type Color = 'white' | 'black';

export interface GameParticipant {
  myColor: Color;
  opponentColor: Color;
  isParticipant: boolean;
}

export function getGameParticipant(
  game: GameState | null,
  currentAccountId: string | null,
  authUser: { id?: string; username?: string } | null = null
): GameParticipant | null {
  if (!game) return null;

  const accountId = currentAccountId ?? authUser?.id ?? null;

  let isWhite = false;
  let isBlack = false;

  if (Array.isArray((game as any).players) && (game as any).players.length >= 2) {
    const players = (game as any).players as string[];
    if (players[0] === accountId) isWhite = true;
    if (players[1] === accountId) isBlack = true;

    // Fallback: match by username when accountId is not available
    if (!isWhite && !isBlack && !accountId && authUser?.username) {
      const username = authUser.username;
      if (players[0] === username) isWhite = true;
      if (players[1] === username) isBlack = true;
    }
  }

  if (!isWhite && !isBlack) return null;

  const myColor: Color = isWhite ? 'white' : 'black';
  const opponentColor: Color = myColor === 'white' ? 'black' : 'white';

  return { myColor, opponentColor, isParticipant: true };
}

