import { useMemo } from 'react';
import { FetchLeaderboardUseCase } from '../use-cases/FetchLeaderboard';
import { useRatingRepository } from '../../game/hooks/useRatingRepository';

/**
 * Hook for dependency injection of FetchLeaderboardUseCase
 */
export function useFetchLeaderboardUseCase() {
  const ratingRepository = useRatingRepository();

  return useMemo(
    () => new FetchLeaderboardUseCase(ratingRepository),
    [ratingRepository]
  );
}
