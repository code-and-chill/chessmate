/**
 * Social Stats Hook (Refactored)
 * 
 * Now uses repositories instead of direct API calls.
 * Aggregates data from multiple sources (friends, stats, etc.)
 */

import { useState, useEffect, useCallback } from 'react';
import { useSocialRepository } from './useSocialRepository';
import type { SocialStats } from '@/types/social';

interface UseSocialStatsResult {
  stats: SocialStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching social statistics
 * Provides overview stats for the social hub
 * 
 * Note: This hook aggregates data from multiple sources.
 * In a full refactoring, this could be a use case that orchestrates
 * multiple repository calls.
 */
export function useSocialStats(userId?: string): UseSocialStatsResult {
  const socialRepository = useSocialRepository();
  const [stats, setStats] = useState<SocialStats | null>(null);
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
      // Get friends to calculate online count
      const friends = await socialRepository.getFriends(userId);
      const onlineFriends = friends.filter((f) => f.online).length;

      // TODO: Get unread messages count from messaging service
      // TODO: Get club membership count
      // TODO: Get global/friend/club ranks

      setStats({
        onlineFriends,
        totalFriends: friends.length,
        clubs: 3, // Mock for now
        unreadMessages: 5, // Mock for now
        globalRank: 1247,
        friendRank: 7,
        clubRank: 5,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch social stats'
      );
      console.error('Error fetching social stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, socialRepository]);

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
