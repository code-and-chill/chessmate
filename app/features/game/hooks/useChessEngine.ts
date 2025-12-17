import { useMemo } from 'react';
import { ChessEngine } from '../domain/ChessEngine';
import type { IChessEngine } from '../domain/IChessEngine';

/**
 * Hook for dependency injection of ChessEngine
 * 
 * Provides a ChessEngine instance for use cases.
 */
export function useChessEngine(): IChessEngine {
  return useMemo(() => new ChessEngine(), []);
}
