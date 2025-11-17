/**
 * useRecentGames Hook
 * 
 * Fetches user's recently played games.
 * Single Responsibility: Fetch recent games from PlayApiClient.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Game } from '../types/game';
import { PlayApiClient } from '../api/playApi';

export interface UseRecentGamesReturn {
  games: Game[];
  loading: boolean;
  error: Error | null;
  refresh(): Promise<void>;
}

/**
 * Hook for fetching user's recently played games.
 * 
 * @param token - Authentication token
 * @param baseUrl - Base URL for play-api
 * @param pollInterval - Polling interval in ms (default: 15000)
 * 
 * @returns Recent games, loading/error states, and refresh method
 * 
 * Usage:
 * ```
 * const { games, loading, error } = useRecentGames(token);
 * ```
 */
export const useRecentGames = (
  token: string,
  baseUrl: string = 'http://localhost:8002',
  pollInterval: number = 15000
): UseRecentGamesReturn => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const clientRef = useRef<PlayApiClient | null>(null);

  // Initialize client
  useEffect(() => {
    if (token) {
      clientRef.current = new PlayApiClient(baseUrl, token);
    }
  }, [baseUrl, token]);

  // Fetch recent games
  const refresh = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      setError(null);
      // TODO: Implement getRecentGames method in PlayApiClient
      // const recentGames = await clientRef.current.getRecentGames();
      // setGames(recentGames);
      setGames([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and polling
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollInterval);
    return () => clearInterval(interval);
  }, [refresh, pollInterval]);

  return {
    games,
    loading,
    error,
    refresh,
  };
};

export default useRecentGames;