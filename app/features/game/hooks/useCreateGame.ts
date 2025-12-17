import { useState, useCallback } from 'react';
import { useCreateGameUseCase } from './useCreateGameUseCase';
import type { CreateGameParams } from '../use-cases/CreateGame';

export interface UseCreateGameResult {
  createGame: (params: CreateGameParams) => Promise<{ gameId: string }>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for creating a new game
 * 
 * This is a thin React adapter that binds UI lifecycle to the CreateGame use case.
 */
export function useCreateGame(): UseCreateGameResult {
  const createGameUseCase = useCreateGameUseCase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createGame = useCallback(
    async (params: CreateGameParams): Promise<{ gameId: string }> => {
      setLoading(true);
      setError(null);
      try {
        const result = await createGameUseCase.execute(params);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [createGameUseCase]
  );

  return { createGame, loading, error };
}
