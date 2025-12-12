export interface MatchmakingRequest {
  userId: string;
  timeControl: string;
  ratingRange?: { min: number; max: number };
}

export interface MatchFound {
  gameId: string;
  opponentId: string;
  opponentUsername: string;
  opponentRating: number;
  timeControl: string;
  color: 'white' | 'black';
}

export interface QueueStatus {
  inQueue: boolean;
  position?: number;
  estimatedWaitTime?: number;
}

