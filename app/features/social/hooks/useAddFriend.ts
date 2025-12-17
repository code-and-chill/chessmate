/**
 * useAddFriend Hook
 * 
 * Hook for sending friend requests
 */

import { useState, useCallback } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseAddFriendResult {
  loading: boolean;
  error: string | null;
  sendFriendRequest: (username: string) => Promise<void>;
}

/**
 * Hook for adding friends by sending friend requests
 */
export function useAddFriend(): UseAddFriendResult {
  const { accountApi } = useApiClients();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendFriendRequest = useCallback(
    async (username: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await accountApi.sendFriendRequest(user.id, username);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send friend request');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountApi, user?.id]
  );

  return {
    loading,
    error,
    sendFriendRequest,
  };
}
