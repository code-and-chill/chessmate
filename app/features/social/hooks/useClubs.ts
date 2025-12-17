/**
 * useClubs Hook
 * 
 * Hook for fetching and managing clubs
 */

import { useState, useEffect, useCallback } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Club } from '@/types/social';

interface UseClubsResult {
  myClubs: Club[];
  discoverClubs: Club[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createClub: (name: string, description: string, isPublic: boolean) => Promise<Club>;
  joinClub: (clubId: string) => Promise<void>;
  leaveClub: (clubId: string) => Promise<void>;
}

/**
 * Hook for managing clubs
 */
export function useClubs(): UseClubsResult {
  const { socialApi } = useApiClients();
  const { user } = useAuth();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [discoverClubs, setDiscoverClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [myClubsData, allClubsData] = await Promise.all([
        socialApi.getMyClubs(user.id),
        socialApi.getClubs(),
      ]);

      setMyClubs(myClubsData);
      
      // Filter out clubs the user is already a member of
      const myClubIds = new Set(myClubsData.map((club) => club.id));
      const discover = allClubsData.filter((club) => !myClubIds.has(club.id));
      setDiscoverClubs(discover);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clubs');
      console.error('Error fetching clubs:', err);
    } finally {
      setLoading(false);
    }
  }, [socialApi, user?.id]);

  const createClub = useCallback(
    async (name: string, description: string, isPublic: boolean): Promise<Club> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        const newClub = await socialApi.createClub(user.id, name, description, isPublic);
        await fetchClubs(); // Refresh clubs list
        return newClub;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create club');
        throw err;
      }
    },
    [socialApi, user?.id, fetchClubs]
  );

  const joinClub = useCallback(
    async (clubId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        await socialApi.joinClub(user.id, clubId);
        await fetchClubs(); // Refresh clubs list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join club');
        throw err;
      }
    },
    [socialApi, user?.id, fetchClubs]
  );

  const leaveClub = useCallback(
    async (clubId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        await socialApi.leaveClub(user.id, clubId);
        await fetchClubs(); // Refresh clubs list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to leave club');
        throw err;
      }
    },
    [socialApi, user?.id, fetchClubs]
  );

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  return {
    myClubs,
    discoverClubs,
    loading,
    error,
    refetch: fetchClubs,
    createClub,
    joinClub,
    leaveClub,
  };
}
