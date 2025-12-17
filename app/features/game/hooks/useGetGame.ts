import { useState, useEffect, useCallback } from 'react';
import { useGetGameUseCase } from './useGetGameUseCase';
import type { GameState } from '@/types/live-game';

export interface UseGetGameResult {
  game: GameState | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a game by ID
 * 
 * This is a thin React adapter that binds UI lifecycle to the GetGame use case.
 */
export function useGetGame(gameId: string | null | undefined): UseGetGameResult {
  const getGameUseCase = useGetGameUseCase();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGame = useCallback(async () => {
    if (!gameId) {
      setGame(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getGameUseCase.execute(gameId);
      setGame(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setGame(null);
    } finally {
      setLoading(false);
    }
  }, [gameId, getGameUseCase]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  return { game, loading, error, refetch: fetchGame };
}
