import { useMemo } from 'react';
import { SubmitPuzzleAttemptUseCase } from '../use-cases/SubmitPuzzleAttempt';
import { usePuzzleRepository } from './usePuzzleRepository';

/**
 * Hook for dependency injection of SubmitPuzzleAttemptUseCase
 */
export function useSubmitPuzzleAttemptUseCase() {
  const puzzleRepository = usePuzzleRepository();

  return useMemo(
    () => new SubmitPuzzleAttemptUseCase(puzzleRepository),
    [puzzleRepository]
  );
}
