import { useState, useCallback } from 'react';
import { useResignGameUseCase } from './useResignGameUseCase';
import type { GameState } from '@/types/live-game';

export interface UseResignGameResult {
  resign: (gameId: string) => Promise<GameState>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for resigning from a game
 * 
 * This is a thin React adapter that binds UI lifecycle to the ResignGame use case.
 */
export function useResignGame(): UseResignGameResult {
  const resignGameUseCase = useResignGameUseCase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resign = useCallback(
    async (gameId: string): Promise<GameState> => {
      setLoading(true);
      setError(null);
      try {
        const result = await resignGameUseCase.execute(gameId);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [resignGameUseCase]
  );

  return { resign, loading, error };
}
