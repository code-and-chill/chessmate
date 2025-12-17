import type { ISocialApiClient } from '@/services/api';
import type {
  ISocialRepository,
  SendFriendRequestParams,
  AcceptFriendRequestParams,
  DeclineFriendRequestParams,
  RemoveFriendParams,
  GetConversationParams,
  SendMessageParams,
  MarkAsReadParams,
  JoinClubParams,
  LeaveClubParams,
  CreateClubParams,
  JoinTournamentParams,
  LeaveTournamentParams,
} from './ISocialRepository';

/**
 * Social Repository Implementation
 * 
 * Wraps ISocialApiClient to provide repository abstraction.
 */
export class SocialRepository implements ISocialRepository {
  constructor(private apiClient: ISocialApiClient) {}

  // Friends
  async getFriends(userId: string) {
    return this.apiClient.getFriends(userId);
  }

  async getFriendRequests(userId: string) {
    return this.apiClient.getFriendRequests(userId);
  }

  async sendFriendRequest(params: SendFriendRequestParams) {
    return this.apiClient.sendFriendRequest(params.fromUserId, params.toUsername);
  }

  async acceptFriendRequest(params: AcceptFriendRequestParams) {
    return this.apiClient.acceptFriendRequest(params.userId, params.requestId);
  }

  async declineFriendRequest(params: DeclineFriendRequestParams) {
    return this.apiClient.declineFriendRequest(params.userId, params.requestId);
  }

  async removeFriend(params: RemoveFriendParams) {
    return this.apiClient.removeFriend(params.userId, params.friendId);
  }

  async searchUsers(query: string) {
    return this.apiClient.searchUsers(query);
  }

  // Messaging
  async getConversations(userId: string) {
    return this.apiClient.getConversations(userId);
  }

  async getConversation(params: GetConversationParams) {
    return this.apiClient.getConversation(params.userId, params.friendId);
  }

  async sendMessage(params: SendMessageParams) {
    return this.apiClient.sendMessage(params.fromUserId, params.toUserId, params.content);
  }

  async markAsRead(params: MarkAsReadParams) {
    return this.apiClient.markAsRead(params.userId, params.conversationId);
  }

  // Clubs
  async getClubs() {
    return this.apiClient.getClubs();
  }

  async getMyClubs(userId: string) {
    return this.apiClient.getMyClubs(userId);
  }

  async joinClub(params: JoinClubParams) {
    return this.apiClient.joinClub(params.userId, params.clubId);
  }

  async leaveClub(params: LeaveClubParams) {
    return this.apiClient.leaveClub(params.userId, params.clubId);
  }

  async createClub(params: CreateClubParams) {
    return this.apiClient.createClub(
      params.userId,
      params.name,
      params.description,
      params.isPublic
    );
  }

  // Tournaments
  async getTournaments() {
    return this.apiClient.getTournaments();
  }

  async joinTournament(params: JoinTournamentParams) {
    return this.apiClient.joinTournament(params.userId, params.tournamentId);
  }

  async leaveTournament(params: LeaveTournamentParams) {
    return this.apiClient.leaveTournament(params.userId, params.tournamentId);
  }
}
