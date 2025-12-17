import { useMemo } from 'react';
import { CreateGameUseCase } from '../use-cases/CreateGame';
import { useGameRepository } from './useGameRepository';

/**
 * Hook for dependency injection of CreateGameUseCase
 */
export function useCreateGameUseCase() {
  const gameRepository = useGameRepository();

  return useMemo(() => new CreateGameUseCase(gameRepository), [gameRepository]);
}
