import { delay } from './mock-data';
import type { GameState } from '@/types/game';
import type { CreateGameRequest, JoinGameRequest, IGameApiClient } from './game.api';

export class MockGameApiClient implements IGameApiClient {
  async createGame(_request: CreateGameRequest): Promise<GameState> {
    await delay(100);
    // return a minimal GameState-shaped object
    return {
      id: `play_${Date.now()}`,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: [],
      sideToMove: 'w',
      whitePlayer: { id: 'Player 1' },
      blackPlayer: { id: 'Player 2' },
      status: 'in_progress',
      result: null,
      endReason: null,
      lastMove: null,
      isLocal: false,
      mode: 'online',
    } as any;
  }

  async joinGame(_gameId: string, _request: JoinGameRequest = {}): Promise<GameState> {
    await delay(80);
    return this.getGameById(_gameId);
  }

  async getGameById(gameId: string): Promise<GameState> {
    await delay(80);

    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const isLocal = String(gameId).startsWith('local-') || String(gameId).startsWith('play_local');

    return {
      id: gameId,
      fen: startingFen,
      moves: [],
      sideToMove: 'w',
      whitePlayer: { id: 'Player 1' },
      blackPlayer: { id: 'Player 2' },
      status: 'in_progress',
      result: null,
      endReason: null,
      lastMove: null,
      isLocal,
      mode: isLocal ? 'local' : 'online',
    } as any;
  }

  async getRecentGames(_userId: string, _limit: number = 10): Promise<GameState[]> {
    await delay(60);
    return [] as GameState[];
  }

  async getActiveGamesForUser(_userId: string): Promise<GameState[]> {
    await delay(60);
    return [] as GameState[];
  }

  async makeMove(_gameId: string, _from: string, _to: string, _promotion?: string): Promise<GameState> {
    await delay(60);
    // For mock, return the same game as getGameById
    return this.getGameById(_gameId);
  }

  async resign(_gameId: string): Promise<GameState> {
    await delay(60);
    return this.getGameById(_gameId);
  }
}
