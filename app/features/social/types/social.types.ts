/**
 * Social Feature Types
 * features/social/types/social.types.ts
 */

export type SocialMode = 'hub' | 'friends' | 'clubs' | 'chat' | 'leaderboard';

export type Friend = {
  id: string;
  username: string;
  rating: number;
  online: boolean;
  lastSeen?: string;
};

export type Club = {
  id: string;
  name: string;
  members: number;
  description: string;
};

export type Message = {
  id: string;
  from: string;
  content: string;
  timestamp: string;
  read: boolean;
};
