import type {UserProfile} from '@/types/account';
import type {Friend, FriendRequest} from '@/types/social';
import type {UserPreferences} from '@/features/settings/types';
import {BaseApiClient} from './base.api';

export interface IAccountApiClient {
  setAuthToken?(token: string): void;
  getProfile(userId: string): Promise<UserProfile>;
  updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile>;
  getFriends(userId: string): Promise<Friend[]>;
  sendFriendRequest(
    fromUserId: string,
    toUsername: string
  ): Promise<FriendRequest>;
  acceptFriendRequest(userId: string, requestId: string): Promise<void>;
  searchUsers(query: string): Promise<UserProfile[]>;
  // Preferences
  getPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences>;
}

export class AccountApiClient extends BaseApiClient implements IAccountApiClient {
  constructor(baseUrl: string = 'http://localhost:8002', authToken?: string) {
      super(baseUrl);
      if (authToken) this.setAuthToken(authToken);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>('GET', `/api/v1/accounts/${userId}`);
  }

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
      return this.request<UserProfile>('PATCH', `/api/v1/accounts/${userId}`, updates);
  }

  async getFriends(userId: string): Promise<Friend[]> {
    return this.request<Friend[]>('GET', `/api/v1/accounts/${userId}/friends`);
  }

    async sendFriendRequest(fromUserId: string, toUsername: string): Promise<FriendRequest> {
        return this.request<FriendRequest>('POST', `/api/v1/accounts/${fromUserId}/friends/request`, {toUsername});
  }

    async acceptFriendRequest(userId: string, requestId: string): Promise<void> {
    await this.request('POST', `/api/v1/accounts/${userId}/friends/${requestId}/accept`);
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    return this.request<UserProfile[]>('GET', `/api/v1/accounts/search?q=${encodeURIComponent(query)}`);
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    return this.request<UserPreferences>('GET', `/api/v1/accounts/${userId}/preferences`);
  }

    async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.request<UserPreferences>('PATCH', `/api/v1/accounts/${userId}/preferences`, updates);
  }
}
