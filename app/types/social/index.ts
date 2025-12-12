export type SocialMode = 'hub' | 'friends' | 'clubs' | 'messages' | 'leaderboard';

export interface Friend {
  id: string;
  username: string;
  displayName?: string;
  avatar: string; // keep required for UI consumers
  rating: number;
  online: boolean;
  playing?: boolean;
  lastSeen?: string;
  // optional so account.Friend (which may not include friendSince) is assignable
  friendSince?: string;
}

export interface FriendRequest {
  id: string;
  // support both flattened and nested shapes used across features
  fromUserId?: string;
  fromUsername?: string;
  from?: {
    id: string;
    username: string;
    avatar?: string;
    rating: number;
  };
  status: 'pending' | 'accepted' | 'declined' | 'rejected';
  // support both names used in different places
  createdAt?: string;
  sentAt?: string;
}

export interface Message {
  id: string;
  // support both sender/recipient and from/to shapes
  senderId?: string;
  senderUsername?: string;
  from?: string;
  to?: string;
  conversationId?: string;
  content: string;
  read: boolean;
  // timestamp alias
  timestamp?: string;
  sentAt?: string;
}

export interface Conversation {
  id: string;
  // either participant object (detailed) or participantId for lightweight usage
  participant?: Friend;
  participantId?: string;
  name?: string;
  lastMessage?: string | Message;
  unreadCount?: number;
  unread?: number;
  time?: string;
  avatar?: string;
  type?: 'direct' | 'club';
  messages?: Message[];
}

export interface Club {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  memberCount?: number;
  members?: number;
  rating?: number;
  isPublic?: boolean;
  joined?: boolean;
  admin?: boolean;
  role?: 'Admin' | 'Moderator' | 'Member';
  createdAt?: string;
  activity?: 'Very Active' | 'Active' | 'Moderate' | 'Low';
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format?: 'swiss' | 'knockout' | 'round-robin' | 'arena';
  timeControl?: string;
  startTime?: string;
  endTime?: string;
  participants?: number;
  maxParticipants?: number;
  status?: 'upcoming' | 'live' | 'finished';
  prizePool?: string;
  clubId?: string;
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

// keep backward-compatible export list (if any other modules import specific names)
export type { SocialMode as Mode };
