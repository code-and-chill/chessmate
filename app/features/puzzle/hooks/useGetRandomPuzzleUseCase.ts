import { useMemo } from 'react';
import { GetRandomPuzzleUseCase } from '../use-cases/GetRandomPuzzle';
import { usePuzzleRepository } from './usePuzzleRepository';

/**
 * Hook for dependency injection of GetRandomPuzzleUseCase
 */
export function useGetRandomPuzzleUseCase() {
  const puzzleRepository = usePuzzleRepository();

  return useMemo(
    () => new GetRandomPuzzleUseCase(puzzleRepository),
    [puzzleRepository]
  );
}
