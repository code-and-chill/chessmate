import { delay } from './mock-data';
import type { ILiveGameApiClient } from './live-game.api';
import type { GameState } from '@/types/live-game';
import { MOCK_USER } from './mock-data';

/**
 * Mock game state stored in memory
 */
interface MockGame {
  id: string;
  status: 'waiting_for_opponent' | 'in_progress' | 'ended';
  rated: boolean;
  decision_reason?: string | null;
  variant_code: string;
  white_account_id?: string;
  black_account_id?: string;
  bot_id?: string | null;
  bot_color?: string | null;
  white_remaining_ms: number;
  black_remaining_ms: number;
  side_to_move: 'white' | 'black';
  fen: string;
  moves: Array<{
    ply: number;
    move_number: number;
    color: string;
    from_square: string;
    to_square: string;
    promotion?: string | null;
    san: string;
    played_at: string;
    elapsed_ms: number;
  }>;
  result?: string | null;
  end_reason?: string | null;
  created_at: string;
  started_at?: string | null;
  ended_at?: string | null;
  inviteCode?: string;
}

// In-memory game storage
const games = new Map<string, MockGame>();
const inviteCodes = new Map<string, string>(); // inviteCode -> gameId

/**
 * Create a new mock game with initial state
 */
function createMockGame(
  gameId: string,
  options: {
    whiteAccountId?: string;
    blackAccountId?: string;
    botId?: string;
    botColor?: 'white' | 'black';
    rated?: boolean;
    timeControl?: string;
    inviteCode?: string;
  } = {}
): MockGame {
  const now = new Date().toISOString();
  const initialTime = 300000; // 5 minutes default
  
  return {
    id: gameId,
    status: options.blackAccountId || options.botId ? 'in_progress' : 'waiting_for_opponent',
    rated: options.rated ?? false,
    decision_reason: null,
    variant_code: 'standard',
    white_account_id: options.whiteAccountId || (options.botColor === 'black' ? MOCK_USER.id : undefined),
    black_account_id: options.blackAccountId || (options.botColor === 'white' ? MOCK_USER.id : undefined),
    bot_id: options.botId || null,
    bot_color: options.botColor || null,
    white_remaining_ms: initialTime,
    black_remaining_ms: initialTime,
    side_to_move: 'white',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    result: null,
    end_reason: null,
    created_at: now,
    started_at: options.blackAccountId || options.botId ? now : null,
    ended_at: null,
    inviteCode: options.inviteCode,
  };
}

/**
 * Apply a move to a game (simplified - just updates FEN and moves)
 */
function applyMove(game: MockGame, from: string, to: string, promotion?: string): MockGame {
  // Simple move application - in a real implementation, this would use chess.js
  // For mock purposes, we'll just add the move and update side_to_move
  const moveNumber = Math.floor(game.moves.length / 2) + 1;
  const ply = game.moves.length + 1;
  const color = game.side_to_move;
  
  // Generate a simple SAN notation
  const san = promotion ? `${from}${to}${promotion}` : `${from}${to}`;
  
  const newMove = {
    ply,
    move_number: color === 'white' ? moveNumber : moveNumber,
    color,
    from_square: from,
    to_square: to,
    promotion: promotion || null,
    san,
    played_at: new Date().toISOString(),
    elapsed_ms: Math.floor(Math.random() * 5000) + 1000, // 1-6 seconds
  };

  return {
    ...game,
    moves: [...game.moves, newMove],
    side_to_move: game.side_to_move === 'white' ? 'black' : 'white',
    status: 'in_progress',
    started_at: game.started_at || new Date().toISOString(),
    // Update clocks (simplified)
    white_remaining_ms: game.side_to_move === 'white' 
      ? game.white_remaining_ms - newMove.elapsed_ms 
      : game.white_remaining_ms,
    black_remaining_ms: game.side_to_move === 'black'
      ? game.black_remaining_ms - newMove.elapsed_ms
      : game.black_remaining_ms,
  };
}

export class MockLiveGameApiClient implements ILiveGameApiClient {
  /**
   * Get game state by ID
   */
  async getGame(gameId: string): Promise<GameState> {
    await delay(200);
    
    let game = games.get(gameId);
    
    // If game doesn't exist, create a mock one
    if (!game) {
      game = createMockGame(gameId, {
        whiteAccountId: MOCK_USER.id,
        blackAccountId: `opponent-${Date.now()}`,
      });
      games.set(gameId, game);
    }
    
    return game as GameState;
  }

  /**
   * Make a move in a game
   */
  async makeMove(gameId: string, from: string, to: string, promotion?: string): Promise<GameState> {
    await delay(300);
    
    const game = games.get(gameId);
    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }
    
    if (game.status !== 'in_progress') {
      throw new Error(`Game ${gameId} is not in progress`);
    }
    
    const updatedGame = applyMove(game, from, to, promotion);
    games.set(gameId, updatedGame);
    
    return updatedGame as GameState;
  }

  /**
   * Resign from a game
   */
  async resign(gameId: string): Promise<GameState> {
    await delay(200);
    
    const game = games.get(gameId);
    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }
    
    const resigningColor = game.white_account_id === MOCK_USER.id ? 'white' : 'black';
    const updatedGame: MockGame = {
      ...game,
      status: 'ended',
      result: resigningColor === 'white' ? '0-1' : '1-0',
      end_reason: 'resignation',
      ended_at: new Date().toISOString(),
    };
    
    games.set(gameId, updatedGame);
    return updatedGame as GameState;
  }

  /**
   * Create a bot game
   */
  async createBotGame(
    userId: string,
    difficulty: string,
    playerColor: 'white' | 'black'
  ): Promise<{ gameId: string }> {
    await delay(400);
    
    const gameId = `bot_${Date.now()}`;
    const botId = `bot-${difficulty}`;
    const botColor = playerColor === 'white' ? 'black' : 'white';
    
    const game = createMockGame(gameId, {
      whiteAccountId: playerColor === 'white' ? userId : undefined,
      blackAccountId: playerColor === 'black' ? userId : undefined,
      botId,
      botColor,
      rated: false, // Bot games are always unrated
    });
    
    games.set(gameId, game);
    return { gameId };
  }

  /**
   * Create a friend game
   */
  async createFriendGame(
    creatorId: string,
    timeControl: string,
    playerColor: 'white' | 'black',
    rated: boolean = true,
    options?: {
      starting_fen?: string;
      is_odds_game?: boolean;
    }
  ): Promise<{ gameId: string; inviteCode: string; rated: boolean; decision_reason?: any }> {
    await delay(300);
    
    const gameId = `friend_${Date.now()}`;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const game = createMockGame(gameId, {
      whiteAccountId: playerColor === 'white' ? creatorId : undefined,
      blackAccountId: playerColor === 'black' ? creatorId : undefined,
      rated,
      inviteCode,
    });
    
    // Override FEN if custom starting position provided
    if (options?.starting_fen) {
      game.fen = options.starting_fen;
    }
    
    games.set(gameId, game);
    inviteCodes.set(inviteCode, gameId);
    
    return {
      gameId,
      inviteCode,
      rated,
      decision_reason: rated ? 'player_choice' : 'local_game',
    };
  }

  /**
   * Join a friend game via invite code
   */
  async joinFriendGame(userId: string, inviteCode: string): Promise<{ gameId: string }> {
    await delay(300);
    
    const gameId = inviteCodes.get(inviteCode);
    if (!gameId) {
      throw new Error(`Invalid invite code: ${inviteCode}`);
    }
    
    const game = games.get(gameId);
    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }
    
    if (game.status !== 'waiting_for_opponent') {
      throw new Error(`Game ${gameId} is not waiting for opponent`);
    }
    
    // Assign the joining player to the empty color
    const updatedGame: MockGame = {
      ...game,
      white_account_id: game.white_account_id || userId,
      black_account_id: game.black_account_id || userId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    };
    
    games.set(gameId, updatedGame);
    return { gameId };
  }

  /**
   * Request a takeback (unrated games only)
   */
  async requestTakeback(gameId: string): Promise<GameState> {
    await delay(200);
    
    const game = games.get(gameId);
    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }
    
    if (game.rated) {
      throw new Error('Takebacks are not allowed in rated games');
    }
    
    if (game.moves.length === 0) {
      throw new Error('No moves to take back');
    }
    
    // Remove last move
    const updatedMoves = game.moves.slice(0, -1);
    const updatedGame: MockGame = {
      ...game,
      moves: updatedMoves,
      side_to_move: game.side_to_move === 'white' ? 'black' : 'white',
    };
    
    games.set(gameId, updatedGame);
    return updatedGame as GameState;
  }

  /**
   * Set custom board position (unrated games only, before start)
   */
  async setPosition(gameId: string, fen: string): Promise<GameState> {
    await delay(200);
    
    const game = games.get(gameId);
    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }
    
    if (game.rated) {
      throw new Error('Setting custom position is not allowed in rated games');
    }
    
    if (game.status !== 'waiting_for_opponent') {
      throw new Error('Can only set position before game starts');
    }
    
    const updatedGame: MockGame = {
      ...game,
      fen,
    };
    
    games.set(gameId, updatedGame);
    return updatedGame as GameState;
  }

  /**
   * Update rated status (only before game starts)
   */
  async updateRatedStatus(gameId: string, rated: boolean): Promise<GameState> {
    await delay(200);
    
    const game = games.get(gameId);
    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }
    
    if (game.status !== 'waiting_for_opponent') {
      throw new Error('Can only update rated status before game starts');
    }
    
    const updatedGame: MockGame = {
      ...game,
      rated,
      decision_reason: rated ? 'player_choice' : 'local_game',
    };
    
    games.set(gameId, updatedGame);
    return updatedGame as GameState;
  }

  /**
   * Legacy method for backward compatibility
   */
  async createGame() {
    await delay(100);
    const gameId = `live_${Date.now()}`;
    const game = createMockGame(gameId, {
      whiteAccountId: MOCK_USER.id,
    });
    games.set(gameId, game);
    return { gameId };
  }
}
