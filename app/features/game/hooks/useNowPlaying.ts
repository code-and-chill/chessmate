/**
 * useNowPlaying Hook (Refactored)
 * 
 * Fetches user's current active games.
 * Now uses FetchNowPlaying use case instead of direct API client instantiation.
 */

import { useState, useEffect, useCallback } from 'react';
import { Game } from '../types/Game';
import { useFetchNowPlayingUseCase } from './useFetchNowPlayingUseCase';
import { mapGameStatesToGames } from '../utils/gameMapper';

export interface UseNowPlayingReturn {
  games: Game[];
  loading: boolean;
  error: Error | null;
  refresh(): Promise<void>;
}

/**
 * Hook for fetching user's active games (now playing).
 * 
 * @param userId - User ID
 * 
 * @returns Active games, loading/error states, and refresh method
 * 
 * Usage:
 * ```
 * const { games, loading, error, refresh } = useNowPlaying(userId);
 * ```
 */
export const useNowPlaying = (userId?: string): UseNowPlayingReturn => {
  const fetchNowPlayingUseCase = useFetchNowPlayingUseCase();
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
      const activeGames = await fetchNowPlayingUseCase.execute(userId);
      // Map GameState[] to Game[] using mapper utility
      const mappedGames = mapGameStatesToGames(activeGames);
      setGames(mappedGames);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [userId, fetchNowPlayingUseCase]);

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
