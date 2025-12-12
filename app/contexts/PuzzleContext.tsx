import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApiClients } from './ApiContext';
import type { Puzzle } from '@/features/puzzle/types/Puzzle';

// Re-export Puzzle type for convenience
export type { Puzzle };

export interface PuzzleAttempt {
  attemptId?: string;
  puzzleId: string;
  solved: boolean;
  timeSpent: number;
  hintsUsed: number;
  attempts: number;
  completedAt?: string;
  timestamp?: string;
  puzzleRating?: number;
  ratingChange?: number;
}

export interface PuzzleStats {
  totalAttempts: number;
  totalSolved: number;
  currentStreak: number;
  longestStreak: number;
  averageRating: number;
  userRating: number;
  byDifficulty: {
    beginner: { attempted: number; solved: number };
    easy: { attempted: number; solved: number };
    medium: { attempted: number; solved: number };
    hard: { attempted: number; solved: number };
    expert: { attempted: number; solved: number };
    master: { attempted: number; solved: number };
  };
  recentAttempts: PuzzleAttempt[];
}

export interface PuzzleFilter {
  difficulty?: string[];
  themes?: string[];
  ratingRange?: { min: number; max: number };
}

interface PuzzleContextType {
  dailyPuzzle: Puzzle | null;
  currentPuzzle: Puzzle | null;
  puzzleStats: PuzzleStats | null;
  isLoading: boolean;
  error: string | null;

  // Puzzle fetching
  getDailyPuzzle: () => Promise<Puzzle>;
  getRandomPuzzle: (filter?: PuzzleFilter) => Promise<Puzzle>;
  getPuzzleById: (id: string) => Promise<Puzzle>;
  getPuzzlesByTheme: (theme: string, limit?: number) => Promise<Puzzle[]>;

  // Puzzle attempts
  submitAttempt: (puzzleId: string, moves: string[], timeSpent: number, hintsUsed: number) => Promise<boolean>;
  getAttemptHistory: () => Promise<PuzzleAttempt[]>;

  // User stats
  getUserStats: () => Promise<PuzzleStats>;
  refreshStats: () => Promise<void>;
}

const PuzzleContext = createContext<PuzzleContextType | undefined>(undefined);

export function PuzzleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { puzzleApi } = useApiClients();
  const [dailyPuzzle, setDailyPuzzle] = useState<Puzzle | null>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [puzzleStats, setPuzzleStats] = useState<PuzzleStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unwrap = <T,>(resp: any): T => {
    if (!resp) throw new Error('Empty response');
    if (typeof resp === 'object' && 'ok' in resp) {
      // ApiEnvelope shape
      return (resp.result ?? ({} as T)) as T;
    }
    return resp as T;
  };

  const getDailyPuzzle = useCallback(async (): Promise<Puzzle> => {
    setIsLoading(true);
    try {
      const resp = await puzzleApi.getDailyPuzzle();
      if (!resp || (typeof resp === 'object' && 'ok' in resp && !resp.ok)) {
        throw new Error((resp && resp.error) || 'Failed to fetch daily puzzle');
      }
      const puzzle = unwrap<Puzzle>(resp);
      setDailyPuzzle(puzzle);
      setError(null);
      return puzzle;
    } catch (err: any) {
      setError('Failed to fetch daily puzzle');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi]);

  const getRandomPuzzle = useCallback(async (filter?: PuzzleFilter): Promise<Puzzle> => {
    setIsLoading(true);
    try {
      let env: any;
      if (typeof (puzzleApi as any).getRandomPuzzle === 'function') {
        env = await (puzzleApi as any).getRandomPuzzle(filter);
      } else if (typeof (puzzleApi as any).getRandom === 'function') {
        env = await (puzzleApi as any).getRandom(filter);
      } else {
        throw new Error('No random puzzle method available');
      }
      const puzzle = unwrap<Puzzle>(env);
      setCurrentPuzzle(puzzle);
      setError(null);
      return puzzle;
    } catch (err: any) {
      setError('Failed to fetch random puzzle');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi]);

  const getPuzzleById = useCallback(async (id: string): Promise<Puzzle> => {
    setIsLoading(true);
    try {
      if (!id) throw new Error('No puzzle id provided');
      const resp = await puzzleApi.getPuzzle(id);
      if (!resp || (typeof resp === 'object' && 'ok' in resp && !resp.ok)) throw new Error((resp && resp.error) || 'Failed to fetch puzzle');
      const puzzle = unwrap<Puzzle>(resp);
      setCurrentPuzzle(puzzle);
      setError(null);
      return puzzle;
    } catch (err: any) {
      setError('Failed to fetch puzzle');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi]);

  const getPuzzlesByTheme = useCallback(async (theme: string, limit: number = 10): Promise<Puzzle[]> => {
    setIsLoading(true);
    try {
      let resp: any;
      if (typeof (puzzleApi as any).getPuzzlesByTheme === 'function') {
        resp = await (puzzleApi as any).getPuzzlesByTheme(theme, limit);
      } else if (typeof (puzzleApi as any).getPuzzles === 'function') {
        resp = await (puzzleApi as any).getPuzzles(theme, limit);
      } else {
        resp = { result: [] };
      }
      const puzzles = unwrap<Puzzle[]>(resp);
      setError(null);
      return puzzles;
    } catch (err: any) {
      setError('Failed to fetch puzzles by theme');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi]);

  const submitAttempt = useCallback(async (
    puzzleId: string,
    moves: string[],
    timeSpent: number,
    hintsUsed: number
  ): Promise<boolean> => {
    
    try {
      const resp = await puzzleApi.submitAttempt(puzzleId, {
        isDaily: false,
        movesPlayed: moves,
        status: 'SUCCESS',
        timeSpentMs: timeSpent,
        hintsUsed,
      } as any);
      setError(null);
      const result = unwrap<any>(resp);
      return !!(result && (typeof resp === 'object' && 'ok' in resp ? resp.ok && result.status === 'SUCCESS' : (result.status === 'SUCCESS')));
    } catch (err: any) {
      setError('Failed to submit attempt');
      throw err;
    }
  }, [puzzleApi]);

  const getAttemptHistory = useCallback(async (): Promise<PuzzleAttempt[]> => {
    const userId = user?.id || 'guest';
    try {
      let resp: any;
      if (typeof (puzzleApi as any).getUserHistory === 'function') {
        resp = await (puzzleApi as any).getUserHistory(userId);
      } else if (typeof (puzzleApi as any).getHistory === 'function') {
        resp = await (puzzleApi as any).getHistory(userId);
      } else {
        resp = { result: [] };
      }
      const history = unwrap<any[]>(resp) ?? [];
      setError(null);
      return (history as any[]).map((item: Record<string, unknown>) => ({
        attemptId: (item.id as string) ?? (item.attempt_id as string) ?? `att_${Date.now()}`,
        puzzleId: (item.puzzle_id as string) ?? (item.puzzleId as string) ?? 'unknown',
        solved: (item.status as string) === 'SUCCESS',
        timeSpent: (item.time_spent_ms as number) ?? (item.timeSpent as number) ?? 0,
        hintsUsed: (item.hints_used as number) ?? (item.hintsUsed as number) ?? 0,
        attempts: (item.attempts as number) ?? 1,
        completedAt: (item.created_at as string) ?? (item.completedAt as string) ?? new Date().toISOString(),
        timestamp: (item.created_at as string) ?? (item.timestamp as string) ?? new Date().toISOString(),
        puzzleRating: (item.puzzle_rating as number) ?? (item.puzzleRating as number) ?? 0,
        ratingChange: (item.rating_change as number) ?? (item.ratingChange as number) ?? 0,
      }));
    } catch (err: any) {
      setError('Failed to get attempt history');
      throw err;
    }
  }, [user, puzzleApi]);

  const getUserStats = useCallback(async (): Promise<PuzzleStats> => {
    const userId = user?.id || 'guest';
    setIsLoading(true);
    try {
      let resp: any;
      if (typeof (puzzleApi as any).getUserStats === 'function') {
        resp = await (puzzleApi as any).getUserStats(userId);
      } else if (typeof (puzzleApi as any).getStats === 'function') {
        resp = await (puzzleApi as any).getStats(userId);
      } else {
        resp = { result: {} };
      }
      const apiStats = unwrap<Record<string, unknown>>(resp) ?? {};
      setError(null);
      const stats: PuzzleStats = {
        totalAttempts: (apiStats.totalAttempts as number) || 0,
        totalSolved: (apiStats.successfulAttempts as number) || 0,
        currentStreak: (apiStats.currentStreak as number) || 0,
        longestStreak: (apiStats.longestStreak as number) || 0,
        averageRating: (apiStats.averageRating as number) || 0,
        userRating: (apiStats.userRating as number) || 0,
        byDifficulty: (apiStats.byDifficulty as PuzzleStats['byDifficulty']) || {
          beginner: { attempted: 0, solved: 0 },
          easy: { attempted: 0, solved: 0 },
          medium: { attempted: 0, solved: 0 },
          hard: { attempted: 0, solved: 0 },
          expert: { attempted: 0, solved: 0 },
          master: { attempted: 0, solved: 0 },
        },
        recentAttempts: await getAttemptHistory(),
      };
      setPuzzleStats(stats);
      return stats;
    } catch (err: any) {
      setError('Failed to fetch user stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, puzzleApi, getAttemptHistory]);

  const refreshStats = useCallback(async () => {
    await getUserStats();
  }, [getUserStats]);

  const value: PuzzleContextType = {
    error,
    dailyPuzzle,
    currentPuzzle,
    puzzleStats,
    isLoading,
    getDailyPuzzle,
    getRandomPuzzle,
    getPuzzleById,
    getPuzzlesByTheme,
    submitAttempt,
    getAttemptHistory,
    getUserStats,
    refreshStats,
  };

  return <PuzzleContext.Provider value={value}>{children}</PuzzleContext.Provider>;
}

export function usePuzzle() {
  const context = useContext(PuzzleContext);
  if (context === undefined) {
    throw new Error('usePuzzle must be used within a PuzzleProvider');
  }
  return context;
}
