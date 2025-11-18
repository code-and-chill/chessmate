/**
 * Custom hooks for data fetching with loading, error, and cache states.
 */

import { useState, useEffect, useCallback } from 'react';
import { useApiClients } from '../contexts/ApiContext';
import { useAuth } from '../contexts/AuthContext';

interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching user profile
 */
export function useProfile(userId?: string): UseDataState<any> {
  const { accountApi } = useApiClients();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const targetUserId = userId || user?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profile = await accountApi.getProfile(targetUserId);
      setData(profile);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [accountApi, targetUserId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { data, loading, error, refetch: fetchProfile };
}

/**
 * Hook for fetching friends list
 */
export function useFriends(userId?: string): UseDataState<any[]> {
  const { accountApi } = useApiClients();
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const targetUserId = userId || user?.id;

  const fetchFriends = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const friends = await accountApi.getFriends(targetUserId);
      setData(friends);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [accountApi, targetUserId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return { data, loading, error, refetch: fetchFriends };
}

/**
 * Hook for fetching user statistics
 */
export function useStats(
  userId?: string,
  timeControl: string = 'blitz'
): UseDataState<any> {
  const { ratingApi } = useApiClients();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const targetUserId = userId || user?.id;

  const fetchStats = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await ratingApi.getStats(targetUserId, timeControl);
      setData(stats);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [ratingApi, targetUserId, timeControl]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}

/**
 * Hook for fetching achievements
 */
export function useAchievements(userId?: string): UseDataState<any[]> {
  const { ratingApi } = useApiClients();
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const targetUserId = userId || user?.id;

  const fetchAchievements = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const achievements = await ratingApi.getAchievements(targetUserId);
      setData(achievements);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [ratingApi, targetUserId]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return { data, loading, error, refetch: fetchAchievements };
}

/**
 * Hook for fetching leaderboard
 */
export function useLeaderboard(
  type: 'global' | 'friends' | 'club' = 'global',
  timeControl: string = 'blitz',
  limit: number = 100
): UseDataState<any[]> {
  const { ratingApi } = useApiClients();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const leaderboard = await ratingApi.getLeaderboard(type, timeControl, limit);
      setData(leaderboard);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [ratingApi, type, timeControl, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { data, loading, error, refetch: fetchLeaderboard };
}

/**
 * Hook for matchmaking
 */
export function useMatchmaking() {
  const { matchmakingApi } = useApiClients();
  const { user } = useAuth();
  const [inQueue, setInQueue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [match, setMatch] = useState<any>(null);

  const joinQueue = useCallback(
    async (timeControl: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        setLoading(true);
        setError(null);
        await matchmakingApi.joinQueue({
          userId: user.id,
          timeControl,
        });
        setInQueue(true);

        // Start polling for match
        const foundMatch = await matchmakingApi.pollForMatch(user.id);
        if (foundMatch) {
          setMatch(foundMatch);
          setInQueue(false);
        }
      } catch (err) {
        setError(err as Error);
        setInQueue(false);
      } finally {
        setLoading(false);
      }
    },
    [matchmakingApi, user?.id]
  );

  const leaveQueue = useCallback(async () => {
    if (!user?.id) return;

    try {
      await matchmakingApi.leaveQueue(user.id);
      setInQueue(false);
    } catch (err) {
      setError(err as Error);
    }
  }, [matchmakingApi, user?.id]);

  return { inQueue, loading, error, match, joinQueue, leaveQueue };
}
