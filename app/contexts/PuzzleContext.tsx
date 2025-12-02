/**
 * Puzzle Context Provider - manages puzzle state, attempts, and user progress.
 */

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

  const getDailyPuzzle = useCallback(async (): Promise<Puzzle> => {
    setIsLoading(true);
    try {
      const puzzle = await puzzleApi.getDailyPuzzle() as Puzzle;
      setDailyPuzzle(puzzle);
      return puzzle;
    } catch (error) {
      console.error('Failed to fetch daily puzzle:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi]);

  const getRandomPuzzle = useCallback(async (filter?: PuzzleFilter): Promise<Puzzle> => {
    setIsLoading(true);
    try {
      const puzzle = await puzzleApi.getRandomPuzzle() as Puzzle;
      setCurrentPuzzle(puzzle);
      return puzzle;
    } catch (error) {
      console.error('Failed to fetch random puzzle:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi]);

  const getPuzzleById = useCallback(async (id: string): Promise<Puzzle> => {
    setIsLoading(true);
    try {
      const puzzle = await puzzleApi.getPuzzle(id) as Puzzle;
      setCurrentPuzzle(puzzle);
      return puzzle;
    } catch (error) {
      console.error('Failed to fetch puzzle:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [puzzleApi]);

  const getPuzzlesByTheme = useCallback(async (theme: string, limit = 10): Promise<Puzzle[]> => {
    setIsLoading(true);
    try {
      return await puzzleApi.getPuzzlesByTheme(theme, limit) as Puzzle[];
    } catch (error) {
      console.error('Failed to fetch puzzles by theme:', error);
      throw error;
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
    // Use guest ID if not authenticated
    const userId = user?.id || 'guest';
    
    try {
      const response = await puzzleApi.submitAttempt(puzzleId, {
        isDaily: false,
        movesPlayed: moves,
        status: 'SUCCESS',
        timeSpentMs: timeSpent,
        hintsUsed,
      });
      
      console.log('Puzzle attempt submitted:', response);
      return response.status === 'SUCCESS';
    } catch (error) {
      console.error('Failed to submit attempt:', error);
      throw error;
    }
  }, [user, puzzleApi]);

  const getAttemptHistory = useCallback(async (): Promise<PuzzleAttempt[]> => {
    // Use guest ID if not authenticated
    const userId = user?.id || 'guest';
    
    try {
      const history = await puzzleApi.getUserHistory(userId);
      // Transform API response to PuzzleAttempt format
      return history.map((item: Record<string, unknown>) => ({
        puzzleId: item.puzzle_id as string,
        solved: item.status === 'SUCCESS',
        timeSpent: item.time_spent_ms as number,
        hintsUsed: item.hints_used as number,
        attempts: 1,
        completedAt: item.created_at as string,
      }));
    } catch (error) {
      console.error('Failed to get attempt history:', error);
      throw error;
    }
  }, [user, puzzleApi]);

  const getUserStats = useCallback(async (): Promise<PuzzleStats> => {
    // Use guest ID if not authenticated
    const userId = user?.id || 'guest';
    
    setIsLoading(true);
    try {
      const apiStats = await puzzleApi.getUserStats(userId) as Record<string, unknown>;
      
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
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, puzzleApi, getAttemptHistory]);

  const refreshStats = useCallback(async () => {
    await getUserStats();
  }, [getUserStats]);

  const value: PuzzleContextType = {
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
