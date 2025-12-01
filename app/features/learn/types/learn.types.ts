/**
 * Learn Feature Types
 * features/learn/types/learn.types.ts
 */

export type LearnMode = 'hub' | 'lessons' | 'tactics' | 'review' | 'openings';
export type LessonCategory = 'beginner' | 'intermediate' | 'advanced';

export type Lesson = {
  id: string;
  title: string;
  category: LessonCategory;
  completed: boolean;
  duration: string;
};

export type GameReview = {
  id: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  accuracy: number;
  blunders: number;
  mistakes: number;
};

export type Opening = {
  id: string;
  name: string;
  eco: string;
  games: number;
  winRate: number;
};

export type TacticCategory = {
  id: string;
  icon: string;
  title: string;
  count: number;
};
