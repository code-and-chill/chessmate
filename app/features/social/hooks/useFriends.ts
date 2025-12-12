/**
 * Friends Hook
 * features/social/hooks/useFriends.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import type { Friend } from '@/types/social';

interface UseFriendsResult {
  friends: Friend[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  challengeFriend: (friendId: string) => Promise<void>;
}

/**
 * Hook for managing friends list
 * Integrated with account-api for friends management
 */
export function useFriends(userId?: string): UseFriendsResult {
  const { accountApi } = useApiClients();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await accountApi.getFriends(userId);
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch friends');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, accountApi]);

  const challengeFriend = useCallback(async (friendId: string) => {
    // TODO: Integrate with matchmaking-api to create challenge
    console.log('Challenge friend:', friendId);
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    loading,
    error,
    refetch: fetchFriends,
    challengeFriend,
  };
}
