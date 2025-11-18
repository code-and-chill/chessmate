/**
 * usePuzzleHistory Hook
 * 
 * Fetches user's puzzle attempt history.
 * Single Responsibility: Fetch puzzle history from PuzzleApiClient.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Puzzle } from '../types/Puzzle';
import { PuzzleApiClient } from '../api/puzzleApi';

export interface PuzzleAttempt {
  puzzleId: string;
  attempted: boolean;
  solved: boolean;
  attempts: number;
  timestamp: Date;
}

export interface UsePuzzleHistoryReturn {
  attempts: PuzzleAttempt[];
  loading: boolean;
  error: Error | null;
  refresh(): Promise<void>;
}

/**
 * Hook for fetching user's puzzle attempt history.
 * 
 * @param baseUrl - Base URL for puzzle-api
 * @param pollInterval - Polling interval in ms (default: 10000)
 * 
 * @returns Puzzle attempts, loading/error states, and refresh method
 * 
 * Usage:
 * ```
 * const { attempts, loading, error } = usePuzzleHistory(token);
 * ```
 */
export const usePuzzleHistory = (
  baseUrl: string = 'http://localhost:8000',
  pollInterval: number = 10000
): UsePuzzleHistoryReturn => {
  const [attempts, setAttempts] = useState<PuzzleAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const clientRef = useRef<PuzzleApiClient | null>(null);

  // Initialize client
  useEffect(() => {
    clientRef.current = new PuzzleApiClient(baseUrl);
  }, [baseUrl]);

  // Fetch puzzle history
  const refresh = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      setError(null);
      // TODO: Implement getUserAttempts or similar method in PuzzleApiClient
      // const userAttempts = await clientRef.current.getUserAttempts();
      // setAttempts(userAttempts);
      setAttempts([]);
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
    attempts,
    loading,
    error,
    refresh,
  };
};

export default usePuzzleHistory;