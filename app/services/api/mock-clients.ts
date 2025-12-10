import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MOCK_USER,
  MOCK_FRIENDS,
  MOCK_STATS,
  MOCK_ACHIEVEMENTS,
  MOCK_PREFERENCES,
  MOCK_LEADERBOARD_GLOBAL,
  MOCK_LEADERBOARD_FRIENDS,
  MOCK_LEADERBOARD_CLUB,
  MOCK_RATING_HISTORY,
  delay,
} from './mock-data';

import type { UserProfile, Friend, FriendRequest } from './account.api';
import type { UserPreferences } from '@/features/settings/types';
import type { RatingHistory, GameStats, LeaderboardEntry, Achievement } from './rating.api';
import type { MatchmakingRequest, MatchFound, QueueStatus } from './matchmaking.api';
import type { AuthResponse } from './auth.api';

const AUTH_TOKEN_KEY = '@chess_auth_token';
const AUTH_USER_KEY = '@chess_auth_user';

export class MockAuthApiClient {
  constructor() {
    void this.initializeMockSession();
  }

  private async initializeMockSession() {
    try {
      const existingToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!existingToken) {
        const session = this.getSession();
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.token);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
      }
    } catch (e) {
      // noop
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    await delay();
    return {
      token: `mock_token_${Date.now()}`,
      user: MOCK_USER,
    };
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    await delay();
    return {
      token: `mock_token_${Date.now()}`,
      user: { ...MOCK_USER, id: String(Date.now()), username, email },
    };
  }

  async refreshToken(_refreshToken: string): Promise<{ token: string }> {
    await delay();
    return { token: `mock_token_refreshed_${Date.now()}` };
  }

  async logout(_token: string): Promise<void> {
    await delay();
  }

  async verifyToken(_token: string): Promise<boolean> {
    await delay();
    return true;
  }

  getSession(): AuthResponse {
    return { token: `mock_token_dev_${Date.now()}`, user: MOCK_USER };
  }
}

export class MockAccountApiClient {
  async getProfile(_userId: string): Promise<UserProfile> {
    await delay();
    return MOCK_USER as unknown as UserProfile;
  }

  async updateProfile(_userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await delay();
    return { ...(MOCK_USER as unknown as UserProfile), ...updates };
  }

  async getFriends(_userId: string): Promise<Friend[]> {
    await delay();
    return MOCK_FRIENDS as unknown as Friend[];
  }

  async sendFriendRequest(fromUserId: string, toUsername: string): Promise<FriendRequest> {
    await delay();
    return {
      id: String(Date.now()),
      fromUserId,
      fromUsername: MOCK_USER.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
    } as FriendRequest;
  }

  async acceptFriendRequest(_userId: string, _requestId: string): Promise<void> {
    await delay();
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    await delay();
    return (MOCK_FRIENDS as any[])
      .filter(f => f.username.toLowerCase().includes(query.toLowerCase()))
      .map(f => ({ ...MOCK_USER, id: f.id, username: f.username, avatar: f.avatar } as unknown as UserProfile));
  }

  async getPreferences(_userId: string): Promise<UserPreferences> {
    await delay();
    return MOCK_PREFERENCES as UserPreferences;
  }

  async updatePreferences(_userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    await delay();
    return { ...MOCK_PREFERENCES, ...updates } as UserPreferences;
  }

  setAuthToken(_token: string) {
    // noop for mock
  }
}

export class MockRatingApiClient {
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
    return MOCK_ACHIEVEMENTS as Achievement[];
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

export class MockMatchmakingApiClient {
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
    return {
      gameId: `game_${Date.now()}`,
      opponentId: opponent.id,
      opponentUsername: opponent.username,
      opponentRating: opponent.rating,
      timeControl: 'blitz',
      color: Math.random() > 0.5 ? 'white' : 'black',
    } as MatchFound;
  }
}

export class MockLearningApiClient {
  async getLessons() {
    await delay(100);
    return [];
  }
}

export class MockSocialApiClient {
  async getFeed() {
    await delay(100);
    return [];
  }
}

export class MockLiveGameApiClient {
  async createGame() {
    await delay(100);
    return { gameId: `live_${Date.now()}` };
  }
}

export class MockPuzzleApiClient {
  async getRandomPuzzle(): Promise<any> {
    await delay(100);
    return {
      ok: true,
      status: 200,
      result: {
        id: 'p_random_1',
        problem: {
          // midgame example FEN
          fen: 'r1bq1rk1/ppp2ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1',
          side_to_move: 'w',
          show_player_section: false,
        },
        // also expose top-level fen and flags to be tolerant
        fen: 'r1bq1rk1/ppp2ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1',
        showPlayerSection: false,
        difficulty: 'easy',
        themes: ['tactics'],
      },
    };
  }

  async submitAttempt(_puzzleId: string, _attempt: any): Promise<any> {
    await delay(50);
    return { ok: true, status: 200, result: { id: `att_${Date.now()}`, puzzleId: _puzzleId, status: 'IN_PROGRESS' } };
  }

  // Return a daily puzzle directly (PuzzleContext expects a Puzzle)
  async getDailyPuzzle(_userId?: string): Promise<any> {
    await delay(80);
    return {
      id: 'p_daily_1',
      problem: {
        fen: 'r2q1rk1/pp3ppp/2n1pn2/2bp4/2B1P3/2N2N2/PPPQ1PPP/R3K2R w KQ - 0 1',
        side_to_move: 'w',
        show_player_section: false,
      },
      // include top-level fields for robustness
      fen: 'r2q1rk1/pp3ppp/2n1pn2/2bp4/2B1P3/2N2N2/PPPQ1PPP/R3K2R w KQ - 0 1',
      showPlayerSection: false,
      difficulty: 'medium',
      themes: ['endgame'],
      rating: 1400,
      initialDepth: 3,
    };
  }

  async getPuzzle(puzzleId: string): Promise<any> {
    await delay(60);
    return {
      id: puzzleId,
      problem: {
        fen: '2r3k1/1b3ppp/p1n1p3/1p1p4/3P4/1P3N2/PB3PPP/3R2K1 w - - 0 1',
        side_to_move: 'w',
        show_player_section: false,
      },
      fen: '2r3k1/1b3ppp/p1n1p3/1p1p4/3P4/1P3N2/PB3PPP/3R2K1 w - - 0 1',
      showPlayerSection: false,
      difficulty: 'easy',
      themes: ['tactics'],
      rating: 1250,
      initialDepth: 2,
    };
  }

  async getPuzzlesByTheme(theme: string, limit: number = 10): Promise<any[]> {
    await delay(80);
    const results = [] as any[];
    for (let i = 0; i < limit; i++) {
      results.push({ id: `p_theme_${theme}_${i}`, problem: { fen: '2r3k1/1b3ppp/p1n1p3/1p1p4/3P4/1P3N2/PB3PPP/3R2K1 w - - 0 1', show_player_section: false }, sideToMove: 'w', difficulty: 'easy', themes: [theme], rating: 1200 + i, initialDepth: 1 });
    }
    return results;
  }

  // Simple history and stats mocks used by PuzzleContext
  async getUserHistory(_userId: string): Promise<any[]> {
    await delay(50);
    return [
      { puzzle_id: 'p1', status: 'SUCCESS', time_spent_ms: 12000, hints_used: 0, created_at: new Date().toISOString() },
    ];
  }

  async getUserStats(_userId: string): Promise<any> {
    await delay(50);
    return {
      totalAttempts: 10,
      successfulAttempts: 6,
      currentStreak: 2,
      longestStreak: 5,
      averageRating: 1300,
      userRating: 1250,
      byDifficulty: {},
    };
  }
}

export class MockPlayApiClient {
  async createGame() {
    await delay(100);
    return { gameId: `play_${Date.now()}` };
  }
}
