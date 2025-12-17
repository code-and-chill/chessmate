/**
 * usePositionAnalysis Hook (Refactored)
 * 
 * Provides real-time chess position analysis using engine-cluster-api.
 * Now uses AnalyzePosition use case instead of direct API calls.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAnalyzePositionUseCase } from '@/features/game/hooks/useAnalyzePositionUseCase';
import type { Candidate, EvaluatePositionResponse } from '@/services/api';

export interface AnalysisOptions {
  /** Maximum search depth (1-30, default: 12) */
  maxDepth?: number;
  /** Time limit in milliseconds (10-30000, default: 1000) */
  timeLimitMs?: number;
  /** Number of principal variations (1-10, default: 1) */
  multiPv?: number;
  /** Enable analysis (default: true) */
  enabled?: boolean;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
}

export interface PositionAnalysisResult {
  /** Best candidate move */
  bestMove: Candidate | null;
  /** All candidate moves */
  candidates: Candidate[];
  /** Current position evaluation in centipawns */
  evaluation: number;
  /** Is analysis in progress */
  isLoading: boolean;
  /** Error if analysis failed */
  error: Error | null;
  /** Analysis time in milliseconds */
  timeMs: number | null;
  /** Manually trigger analysis */
  analyze: () => Promise<void>;
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
 * Hook for real-time position analysis
 * 
 * @param fen - Position in FEN notation
 * @param options - Analysis configuration options
 * 
 * @returns Analysis result with candidates, evaluation, and loading state
 */
export function usePositionAnalysis(
  fen: string | null | undefined,
  options: AnalysisOptions = {}
): PositionAnalysisResult {
  const {
    maxDepth = 12,
    timeLimitMs = 1000,
    multiPv = 1,
    enabled = true,
    debounceMs = 300,
  } = options;

  const analyzePositionUseCase = useAnalyzePositionUseCase();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timeMs, setTimeMs] = useState<number | null>(null);

  // Cache for FEN -> analysis results
  const cacheRef = useRef<
    Map<
      string,
      { candidates: Candidate[]; timeMs: number; timestamp: number }
    >
  >(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Analysis function
  const analyze = useCallback(async () => {
    if (!fen || !enabled) {
      return;
    }

    // Check cache first (5 minute TTL)
    const cacheKey = `${fen}-${maxDepth}-${timeLimitMs}-${multiPv}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      setCandidates(cached.candidates);
      setTimeMs(cached.timeMs);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const sideToMove = getSideToMove(fen);
      const response = await analyzePositionUseCase.execute({
        fen,
        sideToMove,
        maxDepth,
        timeLimitMs,
        multiPv,
      });

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Update cache
      cacheRef.current.set(cacheKey, {
        candidates: response.candidates,
        timeMs: response.time_ms,
        timestamp: Date.now(),
      });

      // Limit cache size (keep last 50 entries)
      if (cacheRef.current.size > 50) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      setCandidates(response.candidates);
      setTimeMs(response.time_ms);
      setError(null);
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setCandidates([]);
      setTimeMs(null);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [fen, maxDepth, timeLimitMs, multiPv, enabled, analyzePositionUseCase]);

  // Debounced analysis effect
  useEffect(() => {
    if (!fen || !enabled) {
      setCandidates([]);
      setIsLoading(false);
      setError(null);
      setTimeMs(null);
      return;
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      analyze();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fen, enabled, debounceMs, analyze]);

  // Calculate best move and evaluation
  const bestMove = candidates.length > 0 ? candidates[0] : null;
  const evaluation = bestMove ? evalToCentipawns(bestMove.eval) : 0;

  return {
    bestMove,
    candidates,
    evaluation,
    isLoading,
    error,
    timeMs,
    analyze,
  };
}
