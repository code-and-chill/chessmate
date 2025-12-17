import { useState, useCallback } from 'react';
import { useMakeMoveUseCase } from './useMakeMoveUseCase';
import type { MakeMoveParams } from '../repositories/IGameRepository';
import type { GameState } from '@/types/live-game';

export interface UseMakeMoveResult {
  makeMove: (params: MakeMoveParams) => Promise<GameState>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for making moves in a game
 * 
 * This is a thin React adapter that binds UI lifecycle to the MakeMove use case.
 * All business logic is in MakeMoveUseCase.
 */
export function useMakeMove(): UseMakeMoveResult {
  const makeMoveUseCase = useMakeMoveUseCase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const makeMove = useCallback(
    async (params: MakeMoveParams): Promise<GameState> => {
      setLoading(true);
      setError(null);
      try {
        const result = await makeMoveUseCase.execute(params);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [makeMoveUseCase]
  );

  return { makeMove, loading, error };
}
