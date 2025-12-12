import { delay, MOCK_STATS, MOCK_LEADERBOARD_GLOBAL, MOCK_LEADERBOARD_FRIENDS, MOCK_LEADERBOARD_CLUB, MOCK_RATING_HISTORY } from './mock-data';
import type { RatingHistory, GameStats, LeaderboardEntry, Achievement } from '@/types/rating';
import type { IRatingApiClient } from './rating.api';

export class MockRatingApiClient implements IRatingApiClient {
  async getStats(_userId: string, timeControl: string): Promise<GameStats> {
    await delay();
    const stats = (MOCK_STATS as any)[timeControl] ?? (MOCK_STATS as any).blitz;
    return { ...stats, timeControl } as GameStats;
  }

  async getRatingHistory(_userId: string, _timeControl: string, _days: number = 30): Promise<RatingHistory[]> {
    await delay();
    return MOCK_RATING_HISTORY as RatingHistory[];
  }

  async getLeaderboard(type: 'global' | 'friends' | 'club'): Promise<LeaderboardEntry[]> {
    await delay();
    const map = {
      global: MOCK_LEADERBOARD_GLOBAL,
      friends: MOCK_LEADERBOARD_FRIENDS,
      club: MOCK_LEADERBOARD_CLUB,
    } as Record<string, any>;
    return map[type] as LeaderboardEntry[];
  }

  async getAchievements(_userId: string): Promise<Achievement[]> {
    await delay();
    return [] as Achievement[];
  }

  async updateRating(_userId: string, _gameId: string, _timeControl: string, result: 'win' | 'loss' | 'draw', _opponentRating: number) {
    await delay();
    const change = result === 'win' ? 15 : result === 'loss' ? -10 : 0;
    return { newRating: 1650 + change, change };
  }

  setAuthToken(_token: string) {
    // noop
  }
}
