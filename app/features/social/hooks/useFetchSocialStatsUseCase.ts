import { useMemo } from 'react';
import { FetchSocialStatsUseCase } from '../use-cases/FetchSocialStats';
import { useRatingRepository } from '../../game/hooks/useRatingRepository';

/**
 * Hook for dependency injection of FetchSocialStatsUseCase
 */
export function useFetchSocialStatsUseCase() {
  const ratingRepository = useRatingRepository();

  return useMemo(
    () => new FetchSocialStatsUseCase(ratingRepository),
    [ratingRepository]
  );
}
