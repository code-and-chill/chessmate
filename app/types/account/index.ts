export interface UserRatings {
  blitz: number;
  rapid: number;
  classical: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  country?: string;
  memberSince: string;
  ratings: UserRatings;
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
