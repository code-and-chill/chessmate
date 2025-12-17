import { useMemo } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { RatingRepository } from '../repositories/RatingRepository';
import type { IRatingRepository } from '../repositories/IRatingRepository';

/**
 * Hook for dependency injection of RatingRepository
 */
export function useRatingRepository(): IRatingRepository {
  const { ratingApi } = useApiClients();

  return useMemo(() => new RatingRepository(ratingApi), [ratingApi]);
}
