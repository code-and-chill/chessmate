/**
 * Account API client - handles user profiles, friends, and social features.
 */

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  country?: string;
  memberSince: string;
  ratings: {
    blitz: number;
    rapid: number;
    classical: number;
  };
}

export interface Friend {
  id: string;
  username: string;
  rating: number;
  online: boolean;
  playing?: boolean;
  lastSeen?: string;
  avatar: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export class AccountApiClient {
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
}
