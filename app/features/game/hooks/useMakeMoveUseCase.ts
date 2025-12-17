import { useMemo } from 'react';
import { MakeMoveUseCase } from '../use-cases/MakeMove';
import { useGameRepository } from './useGameRepository';
import { useChessEngine } from './useChessEngine';

/**
 * Hook for dependency injection of MakeMoveUseCase
 */
export function useMakeMoveUseCase() {
  const gameRepository = useGameRepository();
  const chessEngine = useChessEngine();

  return useMemo(
    () => new MakeMoveUseCase(gameRepository, chessEngine),
    [gameRepository, chessEngine]
  );
}
