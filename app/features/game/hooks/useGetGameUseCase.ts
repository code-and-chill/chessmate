import { useMemo } from 'react';
import { GetGameUseCase } from '../use-cases/GetGame';
import { useGameRepository } from './useGameRepository';

/**
 * Hook for dependency injection of GetGameUseCase
 */
export function useGetGameUseCase() {
  const gameRepository = useGameRepository();

  return useMemo(() => new GetGameUseCase(gameRepository), [gameRepository]);
}
