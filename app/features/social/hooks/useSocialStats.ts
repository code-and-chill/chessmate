/**
 * Social Stats Hook (Refactored)
 * 
 * Now uses repositories instead of direct API calls.
 * Aggregates data from multiple sources (friends, stats, etc.)
 */

import { useState, useEffect, useCallback } from 'react';
import { useSocialRepository } from './useSocialRepository';
import { useApiClients } from '@/contexts/ApiContext';
import { useAuth } from '@/contexts/AuthContext';
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
  const { socialApi, ratingApi } = useApiClients();
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!effectiveUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get friends to calculate online count
      const friends = await socialRepository.getFriends(effectiveUserId);
      const onlineFriends = friends.filter((f) => f.online).length;

      // Get unread messages count from conversations
      let unreadMessages = 0;
      try {
        const conversations = await socialApi.getConversations(effectiveUserId);
        unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      } catch (err) {
        console.warn('Failed to fetch conversations for unread count:', err);
      }

      // Get club membership count
      let clubs = 0;
      try {
        const myClubs = await socialApi.getMyClubs(effectiveUserId);
        clubs = myClubs.length;
      } catch (err) {
        console.warn('Failed to fetch clubs:', err);
      }

      // Get ranks from leaderboards (using blitz as default time control)
      let globalRank: number | undefined;
      let friendRank: number | undefined;
      let clubRank: number | undefined;
      
      try {
        const [globalLeaderboard, friendsLeaderboard, clubLeaderboard] = await Promise.all([
          ratingApi.getLeaderboard('global', 'blitz', 1000).catch(() => []),
          ratingApi.getLeaderboard('friends', 'blitz', 1000).catch(() => []),
          ratingApi.getLeaderboard('club', 'blitz', 1000).catch(() => []),
        ]);

        // Find user's rank in each leaderboard
        globalRank = globalLeaderboard.findIndex((entry) => entry.userId === effectiveUserId) + 1 || undefined;
        friendRank = friendsLeaderboard.findIndex((entry) => entry.userId === effectiveUserId) + 1 || undefined;
        clubRank = clubLeaderboard.findIndex((entry) => entry.userId === effectiveUserId) + 1 || undefined;
      } catch (err) {
        console.warn('Failed to fetch leaderboards for ranks:', err);
      }

      setStats({
        onlineFriends,
        totalFriends: friends.length,
        clubs,
        unreadMessages,
        globalRank: globalRank || undefined,
        friendRank: friendRank || undefined,
        clubRank: clubRank || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch social stats'
      );
      console.error('Error fetching social stats:', err);
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, socialRepository, socialApi, ratingApi]);

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
