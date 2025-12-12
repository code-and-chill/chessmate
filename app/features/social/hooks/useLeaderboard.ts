/**
 * Leaderboard Hook
 * features/social/hooks/useLeaderboard.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
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
export function useLeaderboard(type: LeaderboardType, timeControl: string = 'blitz'): UseLeaderboardResult {
  const { ratingApi } = useApiClients();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ratingApi.getLeaderboard(type, timeControl, 100);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [type, timeControl, ratingApi]);

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
