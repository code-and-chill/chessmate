import { useMemo } from 'react';
import { FetchUserStatsUseCase } from '../use-cases/FetchUserStats';
import { useRatingRepository } from '../../game/hooks/useRatingRepository';

/**
 * Hook for dependency injection of FetchUserStatsUseCase
 */
export function useFetchUserStatsUseCase() {
  const ratingRepository = useRatingRepository();

  return useMemo(
    () => new FetchUserStatsUseCase(ratingRepository),
    [ratingRepository]
  );
}
