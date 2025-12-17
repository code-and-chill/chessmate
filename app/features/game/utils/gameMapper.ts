/**
 * Game Mapper Utility
 * 
 * Utilities for mapping between different game data structures
 */

import type { Game } from '../types/Game';
import type { GameState as BoardGameState } from '@/features/board/hooks/useGameState';

/**
 * Normalized game data structure for useGameState
 */
export interface NormalizedGameState {
  fen: string;
  moves: Array<{
    moveNumber: number;
    color: 'w' | 'b';
    san: string;
  }>;
  sideToMove: 'w' | 'b';
  players: string[];
  status: 'in_progress' | 'ended';
  result: '1-0' | '0-1' | '1/2-1/2' | null;
  endReason: string;
  lastMove: { from: string; to: string } | null;
  isLocal?: boolean;
  mode?: 'local';
  botId?: string;
  botColor?: 'w' | 'b';
  isBotGame?: boolean;
}

/**
 * Normalize game data from API response for useGameState
 * 
 * Handles various API response formats and normalizes them to a consistent structure
 */
export function normalizeGameForState(
  game: any,
  gameId?: string | null
): NormalizedGameState | null {
  if (!game) return null;

  // Normalize moves array
  const normalizedMoves = (game.moves ?? (game as any).moves ?? []).map((m: any) => ({
    moveNumber: m.move_number ?? m.moveNumber ?? 0,
    color: (m.color === 'w' || m.color === 'white' ? 'w' : 'b') as 'w' | 'b',
    san: m.san ?? '',
  }));

  // Determine side to move from FEN or explicit field
  const sideToMove = (() => {
    if (game.sideToMove) {
      return (game.sideToMove === 'w' || game.sideToMove === 'white' ? 'w' : 'b') as 'w' | 'b';
    }
    if ((game as any).side_to_move) {
      return ((game as any).side_to_move === 'w' || (game as any).side_to_move === 'white' ? 'w' : 'b') as 'w' | 'b';
    }
    // Fallback to parsing FEN
    if (game.fen) {
      const fenParts = game.fen.split(' ');
      return (fenParts[1] === 'w' ? 'w' : 'b') as 'w' | 'b';
    }
    return 'w' as 'w' | 'b';
  })();

  // Normalize status
  const status = ((game.status ?? (game as any).status) === 'ended' ? 'ended' : 'in_progress') as 'in_progress' | 'ended';

  // Extract player IDs
  const players = [
    (game as any).white_account_id ?? (game as any).whitePlayer?.id ?? 'Player 1',
    (game as any).black_account_id ?? (game as any).blackPlayer?.id ?? 'Player 2'
  ];

  // Determine if local game
  const isLocal = !!(game.isLocal || (game.mode === 'local') || (gameId && String(gameId).startsWith('local-')));

  return {
    fen: game.fen ?? (game as any).fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: normalizedMoves,
    sideToMove,
    players,
    status,
    result: game.result ?? (game as any).result ?? null,
    endReason: game.endReason ?? (game as any).end_reason ?? '',
    lastMove: game.lastMove ?? (game as any).last_move ?? null,
    isLocal,
    mode: game.mode === 'local' ? 'local' : ((gameId && String(gameId).startsWith('local-')) ? 'local' : undefined),
    botId: (game as any).botId ?? (game as any).bot_id,
    botColor: ((game as any).botColor ?? (game as any).bot_color) as 'w' | 'b' | undefined,
    isBotGame: !!(game as any).botId || !!(game as any).bot_id,
  };
}

/**
 * Map GameState to Game type
 * 
 * Converts the internal GameState format to the Game type used by useNowPlaying and useRecentGames
 * 
 * Note: This is a placeholder implementation. When the API provides endpoints for
 * fetching active/recent games, this should map the API response directly.
 */
export function mapGameStateToGame(gameState: any): Game | null {
  if (!gameState) return null;

  // Extract player information
  const players = gameState.players || [];
  const player1 = players[0] || 'Player 1';
  const player2 = players[1] || 'Player 2';

  // Determine status
  const status = gameState.status === 'ended' ? 'completed' : 'ongoing';

  // Extract moves as string array (SAN notation)
  const moves = (gameState.moves || []).map((m: any) => 
    typeof m === 'string' ? m : (m.san || '')
  ).filter((m: string) => m);

  // Determine winner from result
  let winner: string | undefined;
  if (gameState.result === '1-0') {
    winner = player1;
  } else if (gameState.result === '0-1') {
    winner = player2;
  }

  return {
    id: gameState.id || gameState.gameId || '',
    player1,
    player2,
    status,
    moves,
    winner,
    rated: gameState.rated ?? false,
    decision_reason: gameState.decision_reason ?? gameState.endReason ?? null,
    starting_fen: gameState.starting_fen ?? gameState.fen ?? null,
    is_odds_game: gameState.is_odds_game ?? false,
  };
}

/**
 * Map array of GameState to array of Game
 */
export function mapGameStatesToGames(gameStates: any[]): Game[] {
  return gameStates
    .map(mapGameStateToGame)
    .filter((game): game is Game => game !== null);
}
