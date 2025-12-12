/**
 * Account API client - handles user profiles, friends, and social features.
 */














import type { UserProfile } from '@/types/account';
import type { Friend, FriendRequest } from '@/types/social';
import type { UserPreferences } from '@/features/settings/types';

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

export class AccountApiClient implements IAccountApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = 'http://localhost:8002', authToken?: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `Account API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>('GET', `/api/v1/accounts/${userId}`);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    return this.request<UserProfile>(
      'PATCH',
      `/api/v1/accounts/${userId}`,
      updates
    );
  }

  /**
   * Get friends list
   */
  async getFriends(userId: string): Promise<Friend[]> {
    return this.request<Friend[]>('GET', `/api/v1/accounts/${userId}/friends`);
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(
    fromUserId: string,
    toUsername: string
  ): Promise<FriendRequest> {
    return this.request<FriendRequest>(
      'POST',
      `/api/v1/accounts/${fromUserId}/friends/request`,
      { toUsername }
    );
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(
    userId: string,
    requestId: string
  ): Promise<void> {
    await this.request('POST', `/api/v1/accounts/${userId}/friends/${requestId}/accept`);
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<UserProfile[]> {
    return this.request<UserProfile[]>('GET', `/api/v1/accounts/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    return this.request<UserPreferences>('GET', `/api/v1/accounts/${userId}/preferences`);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    return this.request<UserPreferences>('PATCH', `/api/v1/accounts/${userId}/preferences`, updates);
  }
}
