/**
 * useNowPlaying Hook
 * 
 * Fetches user's current active games.
 * Single Responsibility: Fetch active games from PlayApiClient.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Game } from '../types/game';
import { PlayApiClient } from '../api/playApi';

export interface UseNowPlayingReturn {
  games: Game[];
  loading: boolean;
  error: Error | null;
  refresh(): Promise<void>;
}

/**
 * Hook for fetching user's active games (now playing).
 * 
 * @param token - Authentication token
 * @param baseUrl - Base URL for play-api
 * @param pollInterval - Polling interval in ms (default: 5000)
 * 
 * @returns Active games, loading/error states, and refresh method
 * 
 * Usage:
 * ```
 * const { games, loading, error, refresh } = useNowPlaying(token);
 * ```
 */
export const useNowPlaying = (
  token: string,
  baseUrl: string = 'http://localhost:8002',
  pollInterval: number = 5000
): UseNowPlayingReturn => {
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

  // Fetch active games
  const refresh = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      setError(null);
      // TODO: Implement getActiveGames method in PlayApiClient
      // const activeGames = await clientRef.current.getActiveGames();
      // setGames(activeGames);
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