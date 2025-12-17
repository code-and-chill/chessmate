import type {
  Friend,
  FriendRequest,
  Message,
  Conversation,
  Club,
  Tournament,
} from '@/types/social';

export interface SendFriendRequestParams {
  fromUserId: string;
  toUsername: string;
}

export interface AcceptFriendRequestParams {
  userId: string;
  requestId: string;
}

export interface DeclineFriendRequestParams {
  userId: string;
  requestId: string;
}

export interface RemoveFriendParams {
  userId: string;
  friendId: string;
}

export interface GetConversationParams {
  userId: string;
  friendId: string;
}

export interface SendMessageParams {
  fromUserId: string;
  toUserId: string;
  content: string;
}

export interface MarkAsReadParams {
  userId: string;
  conversationId: string;
}

export interface JoinClubParams {
  userId: string;
  clubId: string;
}

export interface LeaveClubParams {
  userId: string;
  clubId: string;
}

export interface CreateClubParams {
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
}

export interface JoinTournamentParams {
  userId: string;
  tournamentId: string;
}

export interface LeaveTournamentParams {
  userId: string;
  tournamentId: string;
}

export interface ISocialRepository {
  // Friends
  getFriends(userId: string): Promise<Friend[]>;
  getFriendRequests(userId: string): Promise<FriendRequest[]>;
  sendFriendRequest(params: SendFriendRequestParams): Promise<void>;
  acceptFriendRequest(params: AcceptFriendRequestParams): Promise<void>;
  declineFriendRequest(params: DeclineFriendRequestParams): Promise<void>;
  removeFriend(params: RemoveFriendParams): Promise<void>;
  searchUsers(query: string): Promise<Array<{ id: string; username: string; rating: number }>>;

  // Messaging
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(params: GetConversationParams): Promise<Conversation>;
  sendMessage(params: SendMessageParams): Promise<Message>;
  markAsRead(params: MarkAsReadParams): Promise<void>;

  // Clubs
  getClubs(): Promise<Club[]>;
  getMyClubs(userId: string): Promise<Club[]>;
  joinClub(params: JoinClubParams): Promise<void>;
  leaveClub(params: LeaveClubParams): Promise<void>;
  createClub(params: CreateClubParams): Promise<Club>;

  // Tournaments
  getTournaments(): Promise<Tournament[]>;
  joinTournament(params: JoinTournamentParams): Promise<void>;
  leaveTournament(params: LeaveTournamentParams): Promise<void>;
}
