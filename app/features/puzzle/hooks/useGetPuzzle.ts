import { useState, useCallback } from 'react';
import { useGetPuzzleUseCase } from './useGetPuzzleUseCase';
import { useGetDailyPuzzleUseCase } from './useGetDailyPuzzleUseCase';
import { useGetRandomPuzzleUseCase } from './useGetRandomPuzzleUseCase';
import type { Puzzle } from '@/types/puzzle';

export interface UseGetPuzzleResult {
  puzzle: Puzzle | null;
  loading: boolean;
  error: string | null;
  fetchPuzzle: (puzzleId?: string) => Promise<void>;
  fetchDailyPuzzle: () => Promise<void>;
  fetchRandomPuzzle: () => Promise<void>;
}

/**
 * Hook for fetching puzzles
 * 
 * This is a thin React adapter that binds UI lifecycle to puzzle use cases.
 */
export function useGetPuzzle(): UseGetPuzzleResult {
  const getPuzzleUseCase = useGetPuzzleUseCase();
  const getDailyPuzzleUseCase = useGetDailyPuzzleUseCase();
  const getRandomPuzzleUseCase = useGetRandomPuzzleUseCase();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPuzzle = useCallback(async (puzzleId?: string) => {
    if (!puzzleId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getPuzzleUseCase.execute(puzzleId);
      if (response.ok && response.result) {
        setPuzzle(response.result);
      } else {
        setError(response.error || 'Failed to fetch puzzle');
        setPuzzle(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  }, [getPuzzleUseCase]);

  const fetchDailyPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDailyPuzzleUseCase.execute();
      if (response.ok && response.result) {
        // Map response to Puzzle type
        const puzzleData = response.result?.problem ? response.result : response.result;
        setPuzzle(puzzleData as Puzzle);
      } else {
        setError(response.error || 'Failed to fetch daily puzzle');
        setPuzzle(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  }, [getDailyPuzzleUseCase]);

  const fetchRandomPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRandomPuzzleUseCase.execute();
      if (response.ok && response.result) {
        setPuzzle(response.result);
      } else {
        setError(response.error || 'Failed to fetch random puzzle');
        setPuzzle(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setPuzzle(null);
    } finally {
      setLoading(false);
    }
  }, [getRandomPuzzleUseCase]);

  return {
    puzzle,
    loading,
    error,
    fetchPuzzle,
    fetchDailyPuzzle,
    fetchRandomPuzzle,
  };
}
