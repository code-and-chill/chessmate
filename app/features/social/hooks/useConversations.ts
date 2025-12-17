/**
 * useConversations Hook
 * 
 * Hook for fetching and managing conversations
 */

import { useState, useEffect, useCallback } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Conversation } from '@/types/social';

interface UseConversationsResult {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching user conversations
 */
export function useConversations(): UseConversationsResult {
  const { socialApi } = useApiClients();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await socialApi.getConversations(user.id);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [socialApi, user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
  };
}
