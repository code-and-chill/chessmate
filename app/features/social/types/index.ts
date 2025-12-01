/**
 * Social Feature Types
 * features/social/types/index.ts
 */

export type SocialMode = 'hub' | 'friends' | 'clubs' | 'messages' | 'leaderboard';

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

export interface Club {
  id: string;
  name: string;
  members: number;
  activity: 'Very Active' | 'Active' | 'Moderate' | 'Low';
  icon: string;
  role?: 'Admin' | 'Moderator' | 'Member';
  description?: string;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  type: 'direct' | 'club';
  participantId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  rating: number;
  games: number;
  winRate: number;
  avatar: string;
  highlight?: boolean;
}

export type LeaderboardType = 'global' | 'friends' | 'club';

export interface SocialStats {
  onlineFriends: number;
  totalFriends: number;
  clubs: number;
  unreadMessages: number;
  globalRank?: number;
  friendRank?: number;
  clubRank?: number;
}
