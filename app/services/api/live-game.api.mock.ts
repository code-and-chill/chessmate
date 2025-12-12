import { delay } from './mock-data';
import type { ILiveGameApiClient } from './live-game.api';
import type { GameState } from '@/types/live-game';

export class MockLiveGameApiClient implements ILiveGameApiClient {
  getGame(gameId: string): Promise<GameState> {
      throw new Error("Method not implemented.");
  }
  makeMove(gameId: string, from: string, to: string, promotion?: string): Promise<GameState> {
      throw new Error("Method not implemented.");
  }
  resign(gameId: string): Promise<GameState> {
      throw new Error("Method not implemented.");
  }
  createBotGame(userId: string, difficulty: string, playerColor: "white" | "black"): Promise<{ gameId: string; }> {
      throw new Error("Method not implemented.");
  }
  createFriendGame(creatorId: string, timeControl: string, playerColor: "white" | "black", rated?: boolean, options?: any): Promise<{ gameId: string; inviteCode: string; rated: boolean; decision_reason?: any; }> {
      throw new Error("Method not implemented.");
  }
  joinFriendGame(userId: string, inviteCode: string): Promise<{ gameId: string; }> {
      throw new Error("Method not implemented.");
  }
  requestTakeback(gameId: string): Promise<GameState> {
      throw new Error("Method not implemented.");
  }
  setPosition(gameId: string, fen: string): Promise<GameState> {
      throw new Error("Method not implemented.");
  }
  updateRatedStatus(gameId: string, rated: boolean): Promise<GameState> {
      throw new Error("Method not implemented.");
  }
  async createGame() {
    await delay(100);
    return { gameId: `live_${Date.now()}` };
  }
}
