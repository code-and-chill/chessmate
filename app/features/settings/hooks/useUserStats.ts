/**
 * useUserStats Hook (Refactored)
 * 
 * Now uses FetchUserStats use case instead of direct API calls.
 */

import { useState, useEffect, useCallback } from 'react';
import { useFetchUserStatsUseCase } from './useFetchUserStatsUseCase';
import type { UserStats } from '../types';

interface UseUserStatsResult {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserStats(
  userId?: string,
  timeControl: 'blitz' | 'rapid' | 'classical' = 'blitz'
): UseUserStatsResult {
  const fetchUserStatsUseCase = useFetchUserStatsUseCase();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchUserStatsUseCase.execute({
        userId,
        timeControl,
      });

      // Note: Current API returns GameStats without insights
      // Temporary fix: Add default insights until API is updated
      const statsWithInsights = {
        ...data,
        insights: {
          bestOpening: 'Italian Game (62% win rate)',
          avgMoveTime: '8.5 seconds',
          currentStreak: '3 wins',
          ratingTrend: '+45 this month',
        },
      } as UserStats;

      setStats(statsWithInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      console.error('Error fetching user stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, timeControl, fetchUserStatsUseCase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
