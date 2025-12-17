import { useMemo } from 'react';
import { AnalyzePositionUseCase } from '../use-cases/AnalyzePosition';
import { useEngineRepository } from '../../board/hooks/useEngineRepository';

/**
 * Hook for dependency injection of AnalyzePositionUseCase
 */
export function useAnalyzePositionUseCase() {
  const engineRepository = useEngineRepository();

  return useMemo(
    () => new AnalyzePositionUseCase(engineRepository),
    [engineRepository]
  );
}
