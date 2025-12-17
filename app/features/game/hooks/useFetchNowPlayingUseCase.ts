import { useMemo } from 'react';
import { FetchNowPlayingUseCase } from '../use-cases/FetchNowPlaying';
import { useGameRepository } from './useGameRepository';

/**
 * Hook for dependency injection of FetchNowPlayingUseCase
 */
export function useFetchNowPlayingUseCase() {
  const gameRepository = useGameRepository();

  return useMemo(
    () => new FetchNowPlayingUseCase(gameRepository),
    [gameRepository]
  );
}
