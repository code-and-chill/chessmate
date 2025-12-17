/**
 * useUserPreferences Hook (Refactored)
 * 
 * Now uses use cases instead of direct API calls.
 */

import { useState, useEffect, useCallback } from 'react';
import { useFetchUserPreferencesUseCase } from './useFetchUserPreferencesUseCase';
import { useUpdateUserPreferencesUseCase } from './useUpdateUserPreferencesUseCase';
import type { UserPreferences } from '../types';

interface UseUserPreferencesResult {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUserPreferences(
  userId?: string
): UseUserPreferencesResult {
  const fetchUserPreferencesUseCase = useFetchUserPreferencesUseCase();
  const updateUserPreferencesUseCase = useUpdateUserPreferencesUseCase();
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
      const data = await fetchUserPreferencesUseCase.execute(userId);
      setPreferences(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch preferences'
      );
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchUserPreferencesUseCase]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const updated = await updateUserPreferencesUseCase.execute({
          userId,
          updates,
        });
        setPreferences(updated);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update preferences'
        );
        console.error('Error updating preferences:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, updateUserPreferencesUseCase]
  );

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
