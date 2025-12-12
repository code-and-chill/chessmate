import { delay, MOCK_FRIENDS } from './mock-data';
import type { MatchmakingRequest, MatchFound, QueueStatus } from '@/types/matchmaking';
import type { IMatchmakingApiClient } from './matchmaking.api';

export class MockMatchmakingApiClient implements IMatchmakingApiClient {
  setAuthToken?(token: string): void {
      throw new Error("Method not implemented.");
  }
  async createBotGame(userId: string, difficulty: "easy" | "medium" | "hard" | "expert") {
    await delay(200);
    const color: 'white' | 'black' = Math.random() > 0.5 ? 'white' : 'black';
    return { gameId: `bot_${Date.now()}`, color };
  }

  async createFriendChallenge(userId: string, friendId: string, timeControl: string) {
    await delay(150);
    return { gameId: `challenge_${Date.now()}`, challengeCode: `CH${Math.floor(Math.random()*10000)}` };
  }

  async joinChallenge(userId: string, challengeCode: string) {
    await delay(150);
    const color: 'white' | 'black' = Math.random() > 0.5 ? 'white' : 'black';
    return { gameId: `joined_${Date.now()}`, color };
  }

  async joinQueue(_request: MatchmakingRequest): Promise<QueueStatus> {
    await delay(300);
    return { inQueue: true, position: Math.floor(Math.random() * 10) + 1, estimatedWaitTime: 15 } as QueueStatus;
  }

  async leaveQueue(_userId: string): Promise<void> {
    await delay(200);
  }

  async getQueueStatus(_userId: string): Promise<QueueStatus> {
    await delay(200);
    return { inQueue: false } as QueueStatus;
  }

  async pollForMatch(_userId: string, _timeout: number = 30000): Promise<MatchFound | null> {
    await delay(1500);
    const opponents = MOCK_FRIENDS.filter((f: any) => f.online && !f.playing);
    if (opponents.length === 0) return null;
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    const color: 'white' | 'black' = Math.random() > 0.5 ? 'white' : 'black';
    return {
      gameId: `game_${Date.now()}`,
      opponentId: opponent.id,
      opponentUsername: opponent.username,
      opponentRating: opponent.rating,
      timeControl: 'blitz',
      color,
    } as MatchFound;
  }
}
