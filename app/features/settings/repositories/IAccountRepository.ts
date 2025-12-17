import type { UserProfile } from '@/types/account';
import type { Friend, FriendRequest } from '@/types/social';
import type { UserPreferences } from '../types';

export interface UpdateProfileParams {
  userId: string;
  updates: Partial<UserProfile>;
}

export interface SendFriendRequestParams {
  fromUserId: string;
  toUsername: string;
}

export interface AcceptFriendRequestParams {
  userId: string;
  requestId: string;
}

export interface UpdatePreferencesParams {
  userId: string;
  updates: Partial<UserPreferences>;
}

export interface IAccountRepository {
  /**
   * Get user profile
   */
  getProfile(userId: string): Promise<UserProfile>;

  /**
   * Update user profile
   */
  updateProfile(params: UpdateProfileParams): Promise<UserProfile>;

  /**
   * Get user's friends
   */
  getFriends(userId: string): Promise<Friend[]>;

  /**
   * Send a friend request
   */
  sendFriendRequest(params: SendFriendRequestParams): Promise<FriendRequest>;

  /**
   * Accept a friend request
   */
  acceptFriendRequest(params: AcceptFriendRequestParams): Promise<void>;

  /**
   * Search for users
   */
  searchUsers(query: string): Promise<UserProfile[]>;

  /**
   * Get user preferences
   */
  getPreferences(userId: string): Promise<UserPreferences>;

  /**
   * Update user preferences
   */
  updatePreferences(params: UpdatePreferencesParams): Promise<UserPreferences>;
}
