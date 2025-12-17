/**
 * useUserProfile Hook (Refactored)
 * 
 * Now uses use cases instead of direct API calls.
 */

import { useState, useEffect, useCallback } from 'react';
import { useFetchUserProfileUseCase } from './useFetchUserProfileUseCase';
import { useUpdateUserProfileUseCase } from './useUpdateUserProfileUseCase';
import type { UserProfile } from '../types';

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUserProfile(userId?: string): UseUserProfileResult {
  const fetchUserProfileUseCase = useFetchUserProfileUseCase();
  const updateUserProfileUseCase = useUpdateUserProfileUseCase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchUserProfileUseCase.execute(userId);
      setProfile(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch profile'
      );
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchUserProfileUseCase]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const updated = await updateUserProfileUseCase.execute({
          userId,
          updates,
        });
        setProfile(updated);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update profile'
        );
        console.error('Error updating profile:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, updateUserProfileUseCase]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
