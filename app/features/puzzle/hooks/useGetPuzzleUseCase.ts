import { useMemo } from 'react';
import { GetPuzzleUseCase } from '../use-cases/GetPuzzle';
import { usePuzzleRepository } from './usePuzzleRepository';

/**
 * Hook for dependency injection of GetPuzzleUseCase
 */
export function useGetPuzzleUseCase() {
  const puzzleRepository = usePuzzleRepository();

  return useMemo(() => new GetPuzzleUseCase(puzzleRepository), [puzzleRepository]);
}
