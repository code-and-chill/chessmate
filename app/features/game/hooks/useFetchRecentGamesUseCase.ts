import { useMemo } from 'react';
import { FetchRecentGamesUseCase } from '../use-cases/FetchRecentGames';
import { useGameRepository } from './useGameRepository';

/**
 * Hook for dependency injection of FetchRecentGamesUseCase
 */
export function useFetchRecentGamesUseCase() {
  const gameRepository = useGameRepository();

  return useMemo(
    () => new FetchRecentGamesUseCase(gameRepository),
    [gameRepository]
  );
}
