/**
 * Friends Hook (Refactored)
 * 
 * Now uses FetchFriends use case instead of direct API calls.
 */

import { useState, useEffect, useCallback } from 'react';
import { useFetchFriendsUseCase } from './useFetchFriendsUseCase';
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
  const fetchFriendsUseCase = useFetchFriendsUseCase();
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
      const data = await fetchFriendsUseCase.execute(userId);
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch friends');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchFriendsUseCase]);

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
