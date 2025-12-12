export interface PuzzleProblem {
  fen: string;
  side_to_move: 'w' | 'b';
  show_player_section?: boolean;
}

export interface Puzzle {
  id: string;
  problem: PuzzleProblem;
  fen: string;
  difficulty?: string;
  themes?: string[];
  rating?: number;
  initialDepth?: number;
}

export interface PuzzleAttempt {
  isDaily: boolean;
  movesPlayed: string[];
  status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  timeSpentMs: number;
  hintsUsed: number;
}

export interface PuzzleAttemptResponse {
  id: string;
  puzzleId: string;
  ratingChange: number;
  status: string;
}

export interface ApiEnvelope<T = any> {
  ok: boolean;
  status: number;
  result?: T;
  error?: string;
  rateLimit?: { remaining?: number; resetAt?: string } | null;
}

