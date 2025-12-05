import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { GameState } from '@/features/game/types/GameState';
import {useAuth} from "@/contexts/AuthContext";
import {useApiClients} from "@/contexts/ApiContext";

interface BotGameOptions {
  difficulty: string;
  playerColor: 'white' | 'black';
}

interface FriendGameOptions {
  timeControl: string;
  playerColor: 'white' | 'black';
  creatorId: string;
  rated?: boolean;
  starting_fen?: string;
  is_odds_game?: boolean;
}

interface FriendChallenge {
  gameId: string;
  inviteCode: string;
}

interface LocalGameOptions {
  timeControl: {
    initialMs: number;
    incrementMs: number;
  };
  colorPreference?: 'white' | 'black' | 'random';
  opponentAccountId?: string;
  rated?: boolean;
}

interface GameContextType {
  activeGames: Map<string, GameState>;
  currentGameId: string | null;
  isCreatingGame: boolean;
  
  // Game management
  createBotGame: (options: BotGameOptions) => Promise<string>;
  createFriendGame: (options: FriendGameOptions) => Promise<FriendChallenge>;
  createLocalGame: (options: LocalGameOptions) => Promise<GameState>;
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
  const { liveGameApi, playApi } = useApiClients();
  const [activeGames, setActiveGames] = useState<Map<string, GameState>>(new Map());
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const createBotGame = useCallback(async (options: BotGameOptions): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    setIsCreatingGame(true);
    try {
      const { gameId } = await liveGameApi.createBotGame(user.id, options.difficulty, options.playerColor);
      const game = await liveGameApi.getGame(gameId);
      setActiveGames((prev: Map<string, GameState>) => new Map(prev).set(gameId, game));
      setCurrentGameId(gameId);
      return gameId;
    } finally {
      setIsCreatingGame(false);
    }
  }, [user, liveGameApi]);

  const createLocalGame = useCallback(async (options: LocalGameOptions) => {
    setIsCreatingGame(true);
    try {
      return await playApi.createGame({
        timeControl: options.timeControl,
        colorPreference: options.colorPreference,
        rated: options.rated ?? false,
        opponentAccountId: options.opponentAccountId,
      });
    } finally {
      setIsCreatingGame(false);
    }
  }, [playApi]);

  const createFriendGame = useCallback(async (options: FriendGameOptions): Promise<FriendChallenge> => {
    if (!user) throw new Error('User not authenticated');
    setIsCreatingGame(true);
    try {
      const { gameId, inviteCode } = await liveGameApi.createFriendGame(
        options.creatorId,
        options.timeControl,
        options.playerColor,
        options.rated ?? true,
        {
          starting_fen: options.starting_fen,
          is_odds_game: options.is_odds_game,
        }
      );

      const game = await liveGameApi.getGame(gameId);
      setActiveGames((prev: Map<string, GameState>) => new Map(prev).set(gameId, game));
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
      const game = await liveGameApi.getGame(gameId);
      setActiveGames((prev: Map<string, GameState>) => new Map(prev).set(gameId, game));
      setCurrentGameId(gameId);
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    }
  }, [user, liveGameApi]);

  const leaveGame = useCallback(async (gameId: string) => {
    setActiveGames((prev: Map<string, GameState>) => {
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
      setActiveGames((prev: Map<string, GameState>) => new Map(prev).set(gameId, updatedGame));
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
      setActiveGames((prev: Map<string, GameState>) => new Map(prev).set(gameId, game));
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
    createLocalGame,
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
