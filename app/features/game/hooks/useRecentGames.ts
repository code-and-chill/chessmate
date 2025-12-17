/**
 * useRecentGames Hook (Refactored)
 * 
 * Fetches user's recently played games.
 * Now uses FetchRecentGames use case instead of direct API client instantiation.
 */

import { useState, useEffect, useCallback } from 'react';
import { Game } from '../types/Game';
import { useFetchRecentGamesUseCase } from './useFetchRecentGamesUseCase';

export interface UseRecentGamesReturn {
  games: Game[];
  loading: boolean;
  error: Error | null;
  refresh(): Promise<void>;
}

/**
 * Hook for fetching user's recently played games.
 * 
 * @param userId - User ID
 * @param limit - Maximum number of games to fetch (default: 10)
 * 
 * @returns Recent games, loading/error states, and refresh method
 * 
 * Usage:
 * ```
 * const { games, loading, error, refresh } = useRecentGames(userId);
 * ```
 */
export const useRecentGames = (
  userId?: string,
  limit: number = 10
): UseRecentGamesReturn => {
  const fetchRecentGamesUseCase = useFetchRecentGamesUseCase();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setGames([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const recentGames = await fetchRecentGamesUseCase.execute({ userId, limit });
      // TODO: Map GameState[] to Game[] when API provides this endpoint
      setGames([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [userId, limit, fetchRecentGamesUseCase]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    games,
    loading,
    error,
    refresh,
  };
};

export default useRecentGames;
