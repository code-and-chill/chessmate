/**
 * usePuzzleHistory Hook (Refactored)
 * 
 * Fetches user's puzzle attempt history.
 * Now uses GetPuzzleHistory use case instead of direct API client instantiation.
 */

import { useState, useEffect, useCallback } from 'react';
import { useGetPuzzleHistoryUseCase } from './useGetPuzzleHistoryUseCase';

export interface UsePuzzleHistoryReturn {
  history: any[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching user's puzzle attempt history
 * 
 * @param userId - User ID
 * @param limit - Maximum number of entries to fetch (default: 10)
 * @param offset - Offset for pagination (default: 0)
 * 
 * @returns Puzzle history, loading/error states, and refresh method
 */
export function usePuzzleHistory(
  userId?: string,
  limit: number = 10,
  offset: number = 0
): UsePuzzleHistoryReturn {
  const getPuzzleHistoryUseCase = useGetPuzzleHistoryUseCase();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getPuzzleHistoryUseCase.execute({
        userId,
        limit,
        offset,
      });
      if (response.ok && response.result) {
        setHistory(Array.isArray(response.result) ? response.result : []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [userId, limit, offset, getPuzzleHistoryUseCase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    history,
    loading,
    error,
    refresh,
  };
}
