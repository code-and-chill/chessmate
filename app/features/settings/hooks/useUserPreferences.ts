import { useState, useEffect, useCallback } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import type { UserPreferences } from '../types';

interface UseUserPreferencesResult {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUserPreferences(userId?: string): UseUserPreferencesResult {
  const { accountApi } = useApiClients();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await accountApi.getPreferences(userId);
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, accountApi]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await accountApi.updatePreferences(userId, updates);
      setPreferences(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      console.error('Error updating preferences:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, accountApi]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
