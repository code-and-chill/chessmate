/**
 * Social API client - handles friends, messaging, clubs, and tournaments.
 */

import type {
  Friend,
  FriendRequest,
  Message,
  Conversation,
  Club,
  Tournament,
} from '@/contexts/SocialContext';

export class SocialApiClient {
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
        `Social API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Friends
  async getFriends(userId: string): Promise<Friend[]> {
    return this.request<Friend[]>('GET', `/api/v1/accounts/${userId}/friends`);
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    return this.request<FriendRequest[]>('GET', `/api/v1/accounts/${userId}/friends/requests`);
  }

  async sendFriendRequest(fromUserId: string, toUsername: string): Promise<void> {
    await this.request('POST', `/api/v1/accounts/${fromUserId}/friends/request`, { toUsername });
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<void> {
    await this.request('POST', `/api/v1/accounts/${userId}/friends/requests/${requestId}/accept`);
  }

  async declineFriendRequest(userId: string, requestId: string): Promise<void> {
    await this.request('POST', `/api/v1/accounts/${userId}/friends/requests/${requestId}/decline`);
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await this.request('DELETE', `/api/v1/accounts/${userId}/friends/${friendId}`);
  }

  async searchUsers(query: string): Promise<Array<{ id: string; username: string; rating: number }>> {
    return this.request('GET', `/api/v1/accounts/search?q=${encodeURIComponent(query)}`);
  }

  // Messaging
  async getConversations(userId: string): Promise<Conversation[]> {
    return this.request<Conversation[]>('GET', `/api/v1/messages/${userId}/conversations`);
  }

  async getConversation(userId: string, friendId: string): Promise<Conversation> {
    return this.request<Conversation>('GET', `/api/v1/messages/${userId}/conversations/${friendId}`);
  }

  async sendMessage(fromUserId: string, toUserId: string, content: string): Promise<Message> {
    return this.request<Message>('POST', `/api/v1/messages`, {
      from: fromUserId,
      to: toUserId,
      content,
    });
  }

  async markAsRead(userId: string, conversationId: string): Promise<void> {
    await this.request('PATCH', `/api/v1/messages/${userId}/conversations/${conversationId}/read`);
  }

  // Clubs
  async getClubs(): Promise<Club[]> {
    return this.request<Club[]>('GET', '/api/v1/clubs');
  }

  async getMyClubs(userId: string): Promise<Club[]> {
    return this.request<Club[]>('GET', `/api/v1/clubs/user/${userId}`);
  }

  async joinClub(userId: string, clubId: string): Promise<void> {
    await this.request('POST', `/api/v1/clubs/${clubId}/join`, { userId });
  }

  async leaveClub(userId: string, clubId: string): Promise<void> {
    await this.request('POST', `/api/v1/clubs/${clubId}/leave`, { userId });
  }

  async createClub(
    userId: string,
    name: string,
    description: string,
    isPublic: boolean
  ): Promise<Club> {
    return this.request<Club>('POST', '/api/v1/clubs', {
      name,
      description,
      isPublic,
      creatorId: userId,
    });
  }

  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    return this.request<Tournament[]>('GET', '/api/v1/tournaments');
  }

  async joinTournament(userId: string, tournamentId: string): Promise<void> {
    await this.request('POST', `/api/v1/tournaments/${tournamentId}/join`, { userId });
  }

  async leaveTournament(userId: string, tournamentId: string): Promise<void> {
    await this.request('POST', `/api/v1/tournaments/${tournamentId}/leave`, { userId });
  }
}
