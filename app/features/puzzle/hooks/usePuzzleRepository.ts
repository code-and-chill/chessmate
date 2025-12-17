import { useMemo } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { PuzzleRepository } from '../repositories/PuzzleRepository';
import type { IPuzzleRepository } from '../repositories/IPuzzleRepository';

/**
 * Hook for dependency injection of PuzzleRepository
 */
export function usePuzzleRepository(): IPuzzleRepository {
  const { puzzleApi } = useApiClients();

  return useMemo(() => new PuzzleRepository(puzzleApi), [puzzleApi]);
}
