import type { GameState } from '@/types/live-game';
import type { DecisionReason } from '../types/DecisionReason';

export interface MakeMoveParams {
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
}

export interface CreateBotGameParams {
  userId: string;
  difficulty: string;
  playerColor: 'white' | 'black';
}

export interface CreateFriendGameParams {
  creatorId: string;
  timeControl: string;
  playerColor: 'white' | 'black';
  rated?: boolean;
  options?: {
    starting_fen?: string;
    is_odds_game?: boolean;
  };
}

export interface JoinFriendGameParams {
  userId: string;
  inviteCode: string;
}

export interface IGameRepository {
  /**
   * Fetch current game state
   */
  getGame(gameId: string): Promise<GameState>;

  /**
   * Submit a move in a game
   */
  makeMove(params: MakeMoveParams): Promise<GameState>;

  /**
   * Resign from a game
   */
  resign(gameId: string): Promise<GameState>;

  /**
   * Create a bot game
   */
  createBotGame(params: CreateBotGameParams): Promise<{ gameId: string }>;

  /**
   * Create a friend game
   */
  createFriendGame(params: CreateFriendGameParams): Promise<{
    gameId: string;
    inviteCode: string;
    rated: boolean;
    decision_reason?: DecisionReason;
  }>;

  /**
   * Join a friend game via invite code
   */
  joinFriendGame(params: JoinFriendGameParams): Promise<{ gameId: string }>;

  /**
   * Request a takeback (unrated games only)
   */
  requestTakeback(gameId: string): Promise<GameState>;

  /**
   * Set custom board position (unrated games only, before start)
   */
  setPosition(gameId: string, fen: string): Promise<GameState>;

  /**
   * Update rated status (only before game starts)
   */
  updateRatedStatus(gameId: string, rated: boolean): Promise<GameState>;
}
