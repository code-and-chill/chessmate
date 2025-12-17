/**
 * useGameAnalysis Hook
 * 
 * Provides post-game analysis by evaluating all positions in a game.
 * Features: batch processing, progress tracking, accuracy calculation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Candidate } from '@/services/api';
import { useAnalyzePositionUseCase } from './useAnalyzePositionUseCase';

export interface MoveAnalysis {
  /** Move number (1-based) */
  moveNumber: number;
  /** FEN position before the move */
  fen: string;
  /** Move played in UCI notation */
  movePlayed: string;
  /** Best move according to engine */
  bestMove: Candidate | null;
  /** Evaluation before move (centipawns) */
  evaluationBefore: number;
  /** Evaluation after move (centipawns) */
  evaluationAfter: number;
  /** Evaluation difference (negative = mistake/blunder) */
  evalDiff: number;
  /** Move quality: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' */
  quality: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
}

export interface GameAnalysisResult {
  /** Analysis for each move */
  moves: MoveAnalysis[];
  /** Overall accuracy percentage (0-100) */
  accuracy: number;
  /** Is analysis in progress */
  isLoading: boolean;
  /** Current progress (0-100) */
  progress: number;
  /** Error if analysis failed */
  error: Error | null;
  /** Total analysis time in milliseconds */
  totalTimeMs: number;
  /** Manually trigger analysis */
  analyze: () => Promise<void>;
}

export interface GameAnalysisOptions {
  /** Maximum search depth (1-30, default: 15) */
  maxDepth?: number;
  /** Time limit per position in milliseconds (10-30000, default: 2000) */
  timeLimitMs?: number;
  /** Number of principal variations (1-10, default: 1) */
  multiPv?: number;
  /** Enable analysis (default: true) */
  enabled?: boolean;
  /** Batch size for concurrent requests (default: 3) */
  batchSize?: number;
}

/**
 * Extract side to move from FEN string
 */
function getSideToMove(fen: string): 'w' | 'b' {
  const parts = fen.split(' ');
  return (parts[1]?.toLowerCase() === 'b' ? 'b' : 'w') as 'w' | 'b';
}

/**
 * Convert evaluation from pawns to centipawns
 */
function evalToCentipawns(evaluation: number): number {
  return Math.round(evaluation * 100);
}

/**
 * Classify move quality based on evaluation difference
 */
function classifyMoveQuality(evalDiff: number, isWhite: boolean): 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' {
  // Adjust for side to move (negative eval is bad for white, good for black)
  const adjustedDiff = isWhite ? -evalDiff : evalDiff;
  const absDiff = Math.abs(adjustedDiff);

  if (absDiff < 10) return 'best';
  if (absDiff < 50) return 'good';
  if (absDiff < 100) return 'inaccuracy';
  if (absDiff < 200) return 'mistake';
  return 'blunder';
}

/**
 * Calculate accuracy from move analyses
 */
function calculateAccuracy(moves: MoveAnalysis[]): number {
  if (moves.length === 0) return 100;

  let bestMoves = 0;
  let goodMoves = 0;
  let inaccuracies = 0;
  let mistakes = 0;
  let blunders = 0;

  for (const move of moves) {
    switch (move.quality) {
      case 'best':
        bestMoves++;
        break;
      case 'good':
        goodMoves++;
        break;
      case 'inaccuracy':
        inaccuracies++;
        break;
      case 'mistake':
        mistakes++;
        break;
      case 'blunder':
        blunders++;
        break;
    }
  }

  // Weighted accuracy: best=1.0, good=0.8, inaccuracy=0.6, mistake=0.3, blunder=0.0
  const total = moves.length;
  const weighted = (bestMoves * 1.0 + goodMoves * 0.8 + inaccuracies * 0.6 + mistakes * 0.3) / total;
  return Math.round(weighted * 100);
}

/**
 * Hook for post-game analysis
 * 
 * @param positions - Array of FEN positions from the game (one per move)
 * @param movesPlayed - Array of moves played in UCI notation (one per position)
 * @param options - Analysis configuration options
 * 
 * @returns Analysis result with move-by-move evaluation and accuracy
 * 
 * Usage:
 * ```
 * const { moves, accuracy, isLoading, progress } = useGameAnalysis(
 *   gamePositions,
 *   gameMoves,
 *   { maxDepth: 15, timeLimitMs: 2000 }
 * );
 * ```
 */
export function useGameAnalysis(
  positions: string[],
  movesPlayed: string[],
  options: GameAnalysisOptions = {}
): GameAnalysisResult {
  const {
    maxDepth = 15,
    timeLimitMs = 2000,
    multiPv = 1,
    enabled = true,
    batchSize = 3,
  } = options;

  const analyzePositionUseCase = useAnalyzePositionUseCase();

  const [moves, setMoves] = useState<MoveAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Analysis function
  const analyze = useCallback(async () => {
    if (!enabled || positions.length === 0) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setTotalTimeMs(0);

    const startTime = Date.now();
    const analyses: MoveAnalysis[] = [];

    try {
      // Process positions in batches
      for (let i = 0; i < positions.length; i += batchSize) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const batch = positions.slice(i, i + batchSize);
        const batchMoves = movesPlayed.slice(i, i + batchSize);

        // Analyze batch concurrently
        const batchPromises = batch.map(async (fen, batchIndex) => {
          const globalIndex = i + batchIndex;
          const movePlayed = batchMoves[batchIndex] || '';

          try {
            const sideToMove = getSideToMove(fen);
            const response = await analyzePositionUseCase.execute({
              fen,
              sideToMove,
              maxDepth,
              timeLimitMs,
              multiPv,
            });

            if (abortControllerRef.current?.signal.aborted) {
              return null;
            }

            const bestMove = response.candidates[0] || null;
            const evaluationBefore = bestMove ? evalToCentipawns(bestMove.eval) : 0;

            // Get evaluation after move (if next position exists)
            let evaluationAfter = evaluationBefore;
            if (globalIndex < positions.length - 1) {
              const nextFen = positions[globalIndex + 1];
              const nextSideToMove = getSideToMove(nextFen);
              const nextResponse = await analyzePositionUseCase.execute({
                fen: nextFen,
                sideToMove: nextSideToMove,
                maxDepth,
                timeLimitMs,
                multiPv: 1,
              });
              evaluationAfter = nextResponse.candidates[0]
                ? evalToCentipawns(nextResponse.candidates[0].eval)
                : evaluationBefore;
            }

            const evalDiff = evaluationAfter - evaluationBefore;
            const isWhite = sideToMove === 'w';
            const quality = classifyMoveQuality(evalDiff, isWhite);

            return {
              moveNumber: globalIndex + 1,
              fen,
              movePlayed,
              bestMove,
              evaluationBefore,
              evaluationAfter,
              evalDiff,
              quality,
            } as MoveAnalysis;
          } catch (err) {
            console.error(`Error analyzing move ${globalIndex + 1}:`, err);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter((r): r is MoveAnalysis => r !== null);
        analyses.push(...validResults);

        // Update progress
        const newProgress = Math.round(((i + batch.length) / positions.length) * 100);
        setProgress(newProgress);
        setMoves([...analyses]);
      }

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const accuracy = calculateAccuracy(analyses);
      setMoves(analyses);
      setProgress(100);
      setTotalTimeMs(Date.now() - startTime);
      setError(null);
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setMoves([]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [positions, movesPlayed, maxDepth, timeLimitMs, multiPv, enabled, batchSize, analyzePositionUseCase]);

  // Calculate accuracy from current moves
  const accuracy = calculateAccuracy(moves);

  return {
    moves,
    accuracy,
    isLoading,
    progress,
    error,
    totalTimeMs,
    analyze,
  };
}
