/**
 * Game Feature Types
 * 
 * Centralized type definitions for the game feature.
 */

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
  botId?: string;
  botColor?: Color;
  isBotGame?: boolean;
}
