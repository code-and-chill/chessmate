import type { IAccountApiClient } from '@/services/api';
import type {
  IAccountRepository,
  UpdateProfileParams,
  SendFriendRequestParams,
  AcceptFriendRequestParams,
  UpdatePreferencesParams,
} from './IAccountRepository';

/**
 * Account Repository Implementation
 * 
 * Wraps IAccountApiClient to provide repository abstraction.
 */
export class AccountRepository implements IAccountRepository {
  constructor(private apiClient: IAccountApiClient) {}

  async getProfile(userId: string) {
    return this.apiClient.getProfile(userId);
  }

  async updateProfile(params: UpdateProfileParams) {
    return this.apiClient.updateProfile(params.userId, params.updates);
  }

  async getFriends(userId: string) {
    return this.apiClient.getFriends(userId);
  }

  async sendFriendRequest(params: SendFriendRequestParams) {
    return this.apiClient.sendFriendRequest(params.fromUserId, params.toUsername);
  }

  async acceptFriendRequest(params: AcceptFriendRequestParams) {
    return this.apiClient.acceptFriendRequest(params.userId, params.requestId);
  }

  async searchUsers(query: string) {
    return this.apiClient.searchUsers(query);
  }

  async getPreferences(userId: string) {
    return this.apiClient.getPreferences(userId);
  }

  async updatePreferences(params: UpdatePreferencesParams) {
    return this.apiClient.updatePreferences(params.userId, params.updates);
  }
}
