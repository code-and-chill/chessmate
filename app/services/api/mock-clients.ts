/**
 * Mock implementations of API clients for testing without backend.
 */

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

/**
 * Mock Account API Client
 */
export class MockAccountApiClient {
  async getProfile(userId: string): Promise<UserProfile> {
    await delay();
    return MOCK_USER;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await delay();
    return { ...MOCK_USER, ...updates };
  }

  async getFriends(userId: string): Promise<Friend[]> {
    await delay();
    return MOCK_FRIENDS;
  }

  async sendFriendRequest(fromUserId: string, toUsername: string): Promise<FriendRequest> {
    await delay();
    return {
      id: Date.now().toString(),
      fromUserId,
      fromUsername: MOCK_USER.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<void> {
    await delay();
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    await delay();
    return MOCK_FRIENDS.filter(f => 
      f.username.toLowerCase().includes(query.toLowerCase())
    ).map(f => ({
      ...MOCK_USER,
      id: f.id,
      username: f.username,
      avatar: f.avatar,
      ratings: {
        blitz: f.rating,
        rapid: f.rating - 50,
        classical: f.rating + 70,
      },
    }));
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    await delay();
    return MOCK_PREFERENCES;
  }

  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    await delay();
    // In a real implementation, this would persist to the backend
    // For now, just merge the updates with existing preferences (flat structure)
    return {
      ...MOCK_PREFERENCES,
      ...updates,
    };
  }

  setAuthToken(token: string) {
    // Mock implementation
  }
}

/**
 * Mock Rating API Client
 */
export class MockRatingApiClient {
  async getStats(userId: string, timeControl: string): Promise<GameStats> {
    await delay();
    const stats = MOCK_STATS[timeControl as keyof typeof MOCK_STATS] || MOCK_STATS.blitz;
    return { ...stats, timeControl: timeControl as any };
  }

  async getRatingHistory(userId: string, timeControl: string, days: number = 30): Promise<RatingHistory[]> {
    await delay();
    return MOCK_RATING_HISTORY;
  }

  async getLeaderboard(
    type: 'global' | 'friends' | 'club',
    timeControl: string,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    await delay();
    const leaderboards = {
      global: MOCK_LEADERBOARD_GLOBAL,
      friends: MOCK_LEADERBOARD_FRIENDS,
      club: MOCK_LEADERBOARD_CLUB,
    };
    return leaderboards[type];
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    await delay();
    return MOCK_ACHIEVEMENTS;
  }

  async updateRating(
    userId: string,
    gameId: string,
    timeControl: string,
    result: 'win' | 'loss' | 'draw',
    opponentRating: number
  ): Promise<{ newRating: number; change: number }> {
    await delay();
    const change = result === 'win' ? 15 : result === 'loss' ? -10 : 0;
    return {
      newRating: 1650 + change,
      change,
    };
  }

  setAuthToken(token: string) {
    // Mock implementation
  }
}

/**
 * Mock Matchmaking API Client
 */
export class MockMatchmakingApiClient {
  async joinQueue(request: MatchmakingRequest): Promise<QueueStatus> {
    await delay(300);
    return {
      inQueue: true,
      position: Math.floor(Math.random() * 10) + 1,
      estimatedWaitTime: 15,
    };
  }

  async leaveQueue(userId: string): Promise<void> {
    await delay(200);
  }

  async getQueueStatus(userId: string): Promise<QueueStatus> {
    await delay(200);
    return {
      inQueue: false,
    };
  }

  async pollForMatch(userId: string, timeout: number = 30000): Promise<MatchFound | null> {
    await delay(1500); // Simulate matchmaking time
    
    const opponents = MOCK_FRIENDS.filter(f => f.online && !f.playing);
    if (opponents.length === 0) {
      return null;
    }

    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    
    return {
      gameId: 'game_' + Date.now(),
      opponentId: opponent.id,
      opponentUsername: opponent.username,
      opponentRating: opponent.rating,
      timeControl: 'blitz',
      color: Math.random() > 0.5 ? 'white' : 'black',
    };
  }

  async createBotGame(
    userId: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ): Promise<{ gameId: string; color: 'white' | 'black' }> {
    await delay(500);
    return {
      gameId: 'bot_game_' + Date.now(),
      color: Math.random() > 0.5 ? 'white' : 'black',
    };
  }

  async createFriendChallenge(
    userId: string,
    friendId: string,
    timeControl: string
  ): Promise<{ gameId: string; challengeCode: string }> {
    await delay(500);
    return {
      gameId: 'friend_game_' + Date.now(),
      challengeCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };
  }

  async joinChallenge(
    userId: string,
    challengeCode: string
  ): Promise<{ gameId: string; color: 'white' | 'black' }> {
    await delay(500);
    return {
      gameId: 'friend_game_' + Date.now(),
      color: Math.random() > 0.5 ? 'white' : 'black',
    };
  }

  setAuthToken(token: string) {
    // Mock implementation
  }
}
