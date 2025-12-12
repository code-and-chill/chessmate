// Canonical game types for the app (migrated from features/game/types)

export type Color = 'w' | 'b';

export type GameStatus =
  | 'in_progress'
  | 'waiting_for_opponent'
  | 'ended'
  | 'preparing';

export type GameResult = '1-0' | '0-1' | '1/2-1/2' | null;

export interface Move {
  moveNumber: number;
  color: Color;
  san: string; // Standard Algebraic Notation
  isCapture?: boolean; // Move involves capture
  isCheck?: boolean; // Move puts opponent in check
  isCheckmate?: boolean; // Move is checkmate
  annotation?: '!!' | '!' | '!?' | '?!' | '?' | '??'; // Move quality annotation
  piece?: 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'; // Piece type for icon
}

export interface PlayerInfo {
  accountId: string;
  color: Color;
  isSelf: boolean;
  remainingMs: number;
  isActive?: boolean;
}

export interface GameState {
  status: GameStatus;
  result?: GameResult;
  endReason?: string | null;
  moves: Move[];
  currentTurn: Color;
  players: {
    white: PlayerInfo;
    black: PlayerInfo;
  };
}

// DecisionReason and helpers (migrated from features/game/types/DecisionReason.ts)
export type DecisionReason =
  | 'MANUAL'
  | 'LOCAL_AUTO'
  | 'RATING_GAP_AUTO'
  | 'CUSTOM_POSITION_AUTO'
  | 'ODDS_AUTO';

export const DecisionReasonMessages: Record<DecisionReason, string> = {
  MANUAL: 'Player choice',
  LOCAL_AUTO: 'Local games are always unrated',
  RATING_GAP_AUTO: 'Rating difference too large (>500 points)',
  CUSTOM_POSITION_AUTO: 'Custom starting positions are unrated',
  ODDS_AUTO: 'Odds games are unrated',
};

export const DecisionReasonIcons: Record<DecisionReason, string> = {
  MANUAL: '👤',
  LOCAL_AUTO: '🏠',
  RATING_GAP_AUTO: '⚖️',
  CUSTOM_POSITION_AUTO: '♟️',
  ODDS_AUTO: '🎲',
};

export function getDecisionReasonMessage(reason: DecisionReason | null | undefined): string {
  if (!reason) return '';
  return DecisionReasonMessages[reason] || 'System decision';
}

export function getDecisionReasonIcon(reason: DecisionReason | null | undefined): string {
  if (!reason) return 'ℹ️';
  return DecisionReasonIcons[reason] || 'ℹ️';
}

