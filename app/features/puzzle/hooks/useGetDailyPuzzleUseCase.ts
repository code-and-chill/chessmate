import { useMemo } from 'react';
import { GetDailyPuzzleUseCase } from '../use-cases/GetDailyPuzzle';
import { usePuzzleRepository } from './usePuzzleRepository';

/**
 * Hook for dependency injection of GetDailyPuzzleUseCase
 */
export function useGetDailyPuzzleUseCase() {
  const puzzleRepository = usePuzzleRepository();

  return useMemo(
    () => new GetDailyPuzzleUseCase(puzzleRepository),
    [puzzleRepository]
  );
}
