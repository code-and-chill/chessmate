import { useMemo } from 'react';
import { ResignGameUseCase } from '../use-cases/ResignGame';
import { useGameRepository } from './useGameRepository';

/**
 * Hook for dependency injection of ResignGameUseCase
 */
export function useResignGameUseCase() {
  const gameRepository = useGameRepository();

  return useMemo(() => new ResignGameUseCase(gameRepository), [gameRepository]);
}
