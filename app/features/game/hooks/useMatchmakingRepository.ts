import { useMemo } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { MatchmakingRepository } from '../repositories/MatchmakingRepository';
import type { IMatchmakingRepository } from '../repositories/IMatchmakingRepository';

/**
 * Hook for dependency injection of MatchmakingRepository
 */
export function useMatchmakingRepository(): IMatchmakingRepository {
  const { matchmakingApi } = useApiClients();

  return useMemo(() => new MatchmakingRepository(matchmakingApi), [matchmakingApi]);
}
