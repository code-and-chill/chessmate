import { useMemo } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { GameRepository } from '../repositories/GameRepository';
import type { IGameRepository } from '../repositories/IGameRepository';

/**
 * Hook for dependency injection of GameRepository
 * 
 * Provides a GameRepository instance that wraps the liveGameApi client.
 * The repository is memoized to prevent unnecessary re-creation.
 */
export function useGameRepository(): IGameRepository {
  const { liveGameApi } = useApiClients();

  return useMemo(() => new GameRepository(liveGameApi), [liveGameApi]);
}
