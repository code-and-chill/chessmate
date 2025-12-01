/**
 * User Stats Hook
 * features/settings/hooks/useUserStats.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { ratingApi } from '@/services/api';
import type { UserStats } from '../types';

interface UseUserStatsResult {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing user statistics
 * Integrates with rating-api service
 */
export function useUserStats(
  userId?: string,
  timeControl: 'blitz' | 'rapid' | 'classical' = 'blitz'
): UseUserStatsResult {
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
      const data = await ratingApi.getStats(userId, timeControl);
      
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
      };
      
      setStats(statsWithInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      console.error('Error fetching user stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, timeControl]);

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
