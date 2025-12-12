import { delay, MOCK_USER, MOCK_FRIENDS, MOCK_PREFERENCES } from './mock-data';
import type { UserProfile } from '@/types/account';
import type { Friend, FriendRequest } from '@/types/social';
import type { IAccountApiClient } from './account.api';
import type { UserPreferences } from '@/features/settings/types';

export class MockAccountApiClient implements IAccountApiClient {
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

  async sendFriendRequest(fromUserId: string, _toUsername: string): Promise<FriendRequest> {
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
