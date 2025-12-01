/**
 * Puzzle Feature Types
 * features/puzzle/types/puzzle.types.ts
 */

export type PuzzleResult = {
  puzzleId: string;
  solved: boolean;
  moves: string[];
  timeSpent: number;
  rating?: number;
};

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
