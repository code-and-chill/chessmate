import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApiClients } from './ApiContext';
import type { Puzzle } from '@/features/puzzle/types/Puzzle';

// Re-export Puzzle type for convenience
export type { Puzzle };

export interface PuzzleAttempt {
  puzzleId: string;
  solved: boolean;
  timeSpent: number;
  hintsUsed: number;
  attempts: number;
  completedAt: string;
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

  const getDailyPuzzle = useCallback(async (): Promise<Puzzle> => {
    setIsLoading(true);
    const userId = user?.id || 'guest';
    try {
      const puzzle = await puzzleApi.getDailyPuzzle(userId) as Puzzle;
      setDailyPuzzle(puzzle);
      setError(null);
      return puzzle;
    } catch (err: any) {
      setError('Failed to fetch daily puzzle');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi, user?.id]);

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
      const puzzle = (env?.result ?? env) as Puzzle;
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

  const getPuzzleById = useCallback(async (): Promise<Puzzle> => {
    setIsLoading(true);
    const userId = user?.id || 'guest';
    try {
      let resp: any;
      if (typeof (puzzleApi as any).getPuzzle === 'function') {
        resp = await (puzzleApi as any).getPuzzle(userId);
      } else if (typeof (puzzleApi as any).getById === 'function') {
        resp = await (puzzleApi as any).getById(userId);
      } else {
        throw new Error('No getPuzzle method available');
      }
      const puzzle = (resp?.result ?? resp) as Puzzle;
      setCurrentPuzzle(puzzle);
      setError(null);
      return puzzle;
    } catch (err: any) {
      setError('Failed to fetch puzzle');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi, user?.id]);

  const getPuzzlesByTheme = useCallback(async (): Promise<Puzzle[]> => {
    setIsLoading(true);
    const userId = user?.id || 'guest';
    try {
      let resp: any;
      if (typeof (puzzleApi as any).getPuzzlesByTheme === 'function') {
        resp = await (puzzleApi as any).getPuzzlesByTheme(userId);
      } else if (typeof (puzzleApi as any).getPuzzlesByTheme === 'undefined' && typeof (puzzleApi as any).getPuzzles === 'function') {
        resp = await (puzzleApi as any).getPuzzles(userId);
      } else {
        resp = [];
      }
      const puzzles = (resp?.result ?? resp) as Puzzle[];
      setError(null);
      return puzzles;
    } catch (err: any) {
      setError('Failed to fetch puzzles by theme');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi, user?.id]);

  const submitAttempt = useCallback(async (
    puzzleId: string,
    moves: string[],
    timeSpent: number,
    hintsUsed: number
  ): Promise<boolean> => {
    
    try {
      const response = await puzzleApi.submitAttempt(puzzleId, {
        isDaily: false,
        movesPlayed: moves,
        status: 'SUCCESS',
        timeSpentMs: timeSpent,
        hintsUsed,
      });
      setError(null);
      console.log('Puzzle attempt submitted:', response);
      return response.status === 'SUCCESS';
    } catch (err: any) {
      setError('Failed to submit attempt');
      throw err;
    }
  }, [puzzleApi]);

  const getAttemptHistory = useCallback(async (): Promise<PuzzleAttempt[]> => {
    // Use guest ID if not authenticated
    const userId = user?.id || 'guest';
    
    try {
      let resp: any;
      if (typeof (puzzleApi as any).getUserHistory === 'function') {
        resp = await (puzzleApi as any).getUserHistory(userId);
      } else if (typeof (puzzleApi as any).getHistory === 'function') {
        resp = await (puzzleApi as any).getHistory(userId);
      } else {
        resp = [];
      }
      const history = resp?.result ?? resp;
      setError(null);
      // Transform API response to PuzzleAttempt format
      return history.map((item: Record<string, unknown>) => ({
        puzzleId: item.puzzle_id as string,
        solved: item.status === 'SUCCESS',
        timeSpent: item.time_spent_ms as number,
        hintsUsed: item.hints_used as number,
        attempts: 1,
        completedAt: item.created_at as string,
      }));
    } catch (err: any) {
      setError('Failed to get attempt history');
      throw err;
    }
  }, [user, puzzleApi]);

  const getUserStats = useCallback(async (): Promise<PuzzleStats> => {
    // Use guest ID if not authenticated
    const userId = user?.id || 'guest';
    
    setIsLoading(true);
    try {
      let resp: any;
      if (typeof (puzzleApi as any).getUserStats === 'function') {
        resp = await (puzzleApi as any).getUserStats(userId);
      } else if (typeof (puzzleApi as any).getStats === 'function') {
        resp = await (puzzleApi as any).getStats(userId);
      } else {
        resp = {};
      }
      const apiStats = resp?.result ?? resp as Record<string, unknown>;
      setError(null);
      // Transform API response to PuzzleStats format
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
