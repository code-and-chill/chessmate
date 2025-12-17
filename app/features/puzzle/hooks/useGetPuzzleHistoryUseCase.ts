import { useMemo } from 'react';
import { GetPuzzleHistoryUseCase } from '../use-cases/GetPuzzleHistory';
import { usePuzzleRepository } from './usePuzzleRepository';

/**
 * Hook for dependency injection of GetPuzzleHistoryUseCase
 */
export function useGetPuzzleHistoryUseCase() {
  const puzzleRepository = usePuzzleRepository();

  return useMemo(
    () => new GetPuzzleHistoryUseCase(puzzleRepository),
    [puzzleRepository]
  );
}
