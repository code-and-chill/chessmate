/**
 * usePuzzleAttempt Hook (Refactored)
 * 
 * Submits puzzle attempts with debouncing and rate limit handling.
 * Now uses SubmitPuzzleAttempt use case instead of direct API calls.
 */

import { useCallback, useRef, useState } from 'react';
import type { PuzzleAttempt } from '@/services/api/puzzle.api';
import { useSubmitPuzzleAttemptUseCase } from './useSubmitPuzzleAttemptUseCase';
import type { ApiEnvelope, PuzzleAttemptResponse } from '@/types/puzzle';

type ResultEnvelope = {
  ok: boolean;
  status: number;
  result?: any;
  error?: string;
  rate_limit?: any;
};

export function usePuzzleAttempt({
  puzzleId,
  debounceMs = 300,
  onSolved,
  onRateLimited,
}: {
  puzzleId: string;
  debounceMs?: number;
  onSolved?: () => void;
  onRateLimited?: (env: any) => void;
}) {
  const submitPuzzleAttemptUseCase = useSubmitPuzzleAttemptUseCase();
  const [submitting, setSubmitting] = useState(false);
  const [guidance, setGuidance] = useState<string[] | null>(null);
  const [rateLimit, setRateLimit] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const lastPayloadRef = useRef<PuzzleAttempt | null>(null);
  const submittingRef = useRef(false);

  const doSubmit = useCallback(
    async (payload: PuzzleAttempt) => {
      setSubmitting(true);
      setError(null);
      try {
        const env = (await submitPuzzleAttemptUseCase.execute({
          puzzleId,
          attempt: payload,
        })) as any;

        if (!env) {
          const errMsg = 'Submission failed';
          setError(errMsg);
          return { ok: false, error: errMsg } as ResultEnvelope;
        }

        // Bubble up rate-limit to UI via callback (UI will show modal)
        if (env.status === 429) {
          onRateLimited?.(env);
          setRateLimit(env?.rate_limit ?? null);
          return {
            ok: false,
            status: env.status,
            error: env.error ?? 'Rate limited',
            rate_limit: env?.rate_limit ?? null,
          } as ResultEnvelope;
        }

        if (!env.ok) {
          const errMsg = env?.error ?? 'Submission failed';
          setError(errMsg);
          setRateLimit(env?.rate_limit ?? null);
          return { ok: false, error: errMsg } as ResultEnvelope;
        }

        const raw = env.result ?? env;
        const result = raw?.result ?? raw;
        const guidanceResp =
          env?.guidance ?? env?.result?.guidance ?? raw?.guidance ?? null;
        const rate =
          env?.rate_limit ?? env?.rateLimit ?? raw?.rate_limit ?? null;

        setGuidance(guidanceResp);
        setRateLimit(rate);

        const solved =
          (result &&
            (result.correct === true || result.status === 'SUCCESS')) ||
          (raw && raw.status === 'SUCCESS');
        if (solved) onSolved?.();

        return {
          ok: true,
          solved,
          result,
          guidance: guidanceResp,
          rate,
        };
      } catch (err: any) {
        const message = err?.message ?? 'Submission failed';
        setError(message);
        return { ok: false, error: message } as ResultEnvelope;
      } finally {
        setSubmitting(false);
        submittingRef.current = false;
      }
    },
    [submitPuzzleAttemptUseCase, puzzleId, onSolved, onRateLimited]
  );

  const submitDebounced = useCallback(
    (payload: PuzzleAttempt) => {
      lastPayloadRef.current = payload;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = (setTimeout(() => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        void doSubmit(lastPayloadRef.current as PuzzleAttempt);
      }, debounceMs) as unknown) as number;
    },
    [doSubmit, debounceMs]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { submitDebounced, submitting, guidance, rateLimit, error, cancel };
}
