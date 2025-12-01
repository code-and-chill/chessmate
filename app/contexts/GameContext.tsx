/**
 * Game Context Provider - manages game state, moves, and game lifecycle.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApiClients } from './ApiContext';

interface GameMove {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
  timestamp: string;
}

interface GameState {
  id: string;
  white_player_id: string;
  black_player_id: string;
  fen: string;
  status: 'waiting' | 'active' | 'completed';
  result?: 'white_wins' | 'black_wins' | 'draw';
  moves: GameMove[];
  time_control: string;
  created_at: string;
}

interface BotGameOptions {
  difficulty: string;
  playerColor: 'white' | 'black';
}

interface FriendGameOptions {
  timeControl: string;
  playerColor: 'white' | 'black';
  creatorId: string;
}

interface FriendChallenge {
  gameId: string;
  inviteCode: string;
}

interface GameContextType {
  activeGames: Map<string, GameState>;
  currentGameId: string | null;
  isCreatingGame: boolean;
  
  // Game management
  createBotGame: (options: BotGameOptions) => Promise<string>;
  createFriendGame: (options: FriendGameOptions) => Promise<FriendChallenge>;
  joinFriendGame: (inviteCode: string) => Promise<string>;
  joinGame: (gameId: string) => Promise<void>;
  leaveGame: (gameId: string) => Promise<void>;
  
  // Move handling
  makeMove: (gameId: string, from: string, to: string, promotion?: string) => Promise<void>;
  
  // Game state
  getGame: (gameId: string) => GameState | undefined;
  refreshGame: (gameId: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { liveGameApi } = useApiClients();
  const [activeGames, setActiveGames] = useState<Map<string, GameState>>(new Map());
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const createBotGame = useCallback(async (options: BotGameOptions): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsCreatingGame(true);
    try {
      const { gameId } = await liveGameApi.createBotGame(user.id, options.difficulty, options.playerColor);
      
      const mockGame: GameState = {
        id: gameId,
        white_player_id: options.playerColor === 'white' ? user.id : 'bot-stockfish',
        black_player_id: options.playerColor === 'black' ? user.id : 'bot-stockfish',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        status: 'active',
        moves: [],
        time_control: '10+0',
        created_at: new Date().toISOString(),
      };
      
      setActiveGames((prev) => new Map(prev).set(gameId, mockGame));
      setCurrentGameId(gameId);
      
      return gameId;
    } finally {
      setIsCreatingGame(false);
    }
  }, [user, liveGameApi]);

  const createFriendGame = useCallback(async (options: FriendGameOptions): Promise<FriendChallenge> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsCreatingGame(true);
    try {
      const { gameId, inviteCode } = await liveGameApi.createFriendGame(
        options.creatorId,
        options.timeControl,
        options.playerColor
      );
      
      const mockGame: GameState = {
        id: gameId,
        white_player_id: options.playerColor === 'white' ? user.id : '',
        black_player_id: options.playerColor === 'black' ? user.id : '',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        status: 'waiting',
        moves: [],
        time_control: options.timeControl,
        created_at: new Date().toISOString(),
      };
      
      setActiveGames((prev) => new Map(prev).set(gameId, mockGame));
      
      return { gameId, inviteCode };
    } finally {
      setIsCreatingGame(false);
    }
  }, [user, liveGameApi]);

  const joinFriendGame = useCallback(async (inviteCode: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsCreatingGame(true);
    try {
      const { gameId } = await liveGameApi.joinFriendGame(user.id, inviteCode);
      return gameId;
    } finally {
      setIsCreatingGame(false);
    }
  }, [user, liveGameApi]);

  const joinGame = useCallback(async (gameId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // TODO: Fetch game state from API
      const mockGame: GameState = {
        id: gameId,
        white_player_id: user.id,
        black_player_id: 'opponent-id',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        status: 'active',
        moves: [],
        time_control: '10+0',
        created_at: new Date().toISOString(),
      };
      
      setActiveGames((prev) => new Map(prev).set(gameId, mockGame));
      setCurrentGameId(gameId);
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    }
  }, [user]);

  const leaveGame = useCallback(async (gameId: string) => {
    setActiveGames((prev) => {
      const updated = new Map(prev);
      updated.delete(gameId);
      return updated;
    });
    
    if (currentGameId === gameId) {
      setCurrentGameId(null);
    }
  }, [currentGameId]);

  const makeMove = useCallback(async (gameId: string, from: string, to: string, promotion?: string) => {
    const game = activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    
    try {
      const updatedGame = await liveGameApi.makeMove(gameId, from, to, promotion) as GameState;
      setActiveGames((prev) => new Map(prev).set(gameId, updatedGame));
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }, [activeGames, liveGameApi]);

  const getGame = useCallback((gameId: string) => {
    return activeGames.get(gameId);
  }, [activeGames]);

  const refreshGame = useCallback(async (gameId: string) => {
    try {
      const game = await liveGameApi.getGame(gameId) as GameState;
      setActiveGames((prev) => new Map(prev).set(gameId, game));
    } catch (error) {
      console.error('Failed to refresh game:', error);
      throw error;
    }
  }, [liveGameApi]);

  const value: GameContextType = {
    activeGames,
    currentGameId,
    isCreatingGame,
    createBotGame,
    createFriendGame,
    joinFriendGame,
    joinGame,
    leaveGame,
    makeMove,
    getGame,
    refreshGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
