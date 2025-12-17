/**
 * Leaderboard Hook (Refactored)
 * 
 * Now uses FetchLeaderboard use case instead of direct API calls.
 */

import { useState, useEffect, useCallback } from 'react';
import { useFetchLeaderboardUseCase } from './useFetchLeaderboardUseCase';
import type { LeaderboardEntry, LeaderboardType } from '@/types/social';

interface UseLeaderboardResult {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching leaderboard data
 * Integrated with rating-api for rankings
 */
export function useLeaderboard(
  type: LeaderboardType,
  timeControl: string = 'blitz'
): UseLeaderboardResult {
  const fetchLeaderboardUseCase = useFetchLeaderboardUseCase();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchLeaderboardUseCase.execute({
        type,
        timeControl,
        limit: 100,
      });
      setEntries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch leaderboard'
      );
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [type, timeControl, fetchLeaderboardUseCase]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
}
