import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApiClients } from './ApiContext';
import type { MatchFound, MatchmakingRequest } from '@/types/matchmaking';

// Re-export types for convenience
export type { MatchFound, MatchmakingRequest };

interface QueueStatus {
  inQueue?: boolean;
  position?: number;
  estimatedWaitTime?: number;
  playersInQueue?: number;
  waitTime?: number;
}

interface MatchmakingContextType {
  isInQueue: boolean;
  queueStatus: QueueStatus | null;
  error: string | null;
  matchFound: MatchFound | null;

  joinQueue: (options: { timeControl: string; ratingRange: { min: number; max: number } }) => Promise<void>;
  leaveQueue: () => Promise<void>;
}

const MatchmakingContext = createContext<MatchmakingContextType | undefined>(undefined);

export function MatchmakingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { matchmakingApi } = useApiClients();
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [waitTimer, setWaitTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [matchFound, setMatchFound] = useState<MatchFound | null>(null);

  // Poll for match updates
  useEffect(() => {
    if (!isInQueue || !user) return;
    let isActive = true;
    let pollTimeout: ReturnType<typeof setTimeout> | null = null;

    const pollForMatch = async () => {
      try {
        const match = await matchmakingApi.pollForMatch(user.id, 30000);
        if (isActive && match) {
          setIsInQueue(false);
          setMatchFound(match);
        } else if (isActive && isInQueue) {
          pollTimeout = setTimeout(pollForMatch, 5000); // poll every 5s
        }
      } catch (err) {
        console.error('matchmaking.pollForMatch error', err);
        setError('Error polling for match');
        if (isActive && isInQueue) {
          pollTimeout = setTimeout(pollForMatch, 10000); // backoff on error
        }
      }
    };

    pollForMatch();

    const timerInterval = setInterval(() => {
      if (isActive && isInQueue) {
        setWaitTimer((prev) => prev + 1);
        matchmakingApi.getQueueStatus(user.id).then((status) => {
          if (isActive && status) {
            setQueueStatus({
              playersInQueue: (status as any).position ?? (status as any).playersInQueue ?? 0,
              waitTime: waitTimer,
              estimatedWaitTime: (status as any).estimatedWaitTime ?? 15,
            });
          }
        }).catch((e) => {
          console.error('matchmaking.getQueueStatus error', e);
          setError('Error fetching queue status');
        });
      }
    }, 2000); // update every 2s for performance

    return () => {
      isActive = false;
      clearInterval(timerInterval);
      if (pollTimeout) clearTimeout(pollTimeout as any);
    };
  }, [isInQueue, user, matchmakingApi, waitTimer]);

  const joinQueue = useCallback(
    async (options: { timeControl: string; ratingRange: { min: number; max: number } }) => {
      if (!user) {
        setError('User not authenticated');
        throw new Error('User not authenticated');
      }
      try {
        await matchmakingApi.joinQueue({
          userId: user.id,
          timeControl: options.timeControl,
          ratingRange: options.ratingRange,
        });
        setIsInQueue(true);
        setWaitTimer(0);
        setError(null);
      } catch (err: any) {
        setError('Failed to join queue');
        throw err;
      }
    },
    [user, matchmakingApi]
  );

  const leaveQueue = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      await matchmakingApi.leaveQueue(user.id);
      setIsInQueue(false);
      setQueueStatus(null);
      setWaitTimer(0);
      setError(null);
    } catch (err: any) {
      setError('Failed to leave queue');
      throw err;
    }
  }, [user, matchmakingApi]);


  const value: MatchmakingContextType = {
    isInQueue,
    queueStatus,
    error,
    matchFound,
    joinQueue,
    leaveQueue,
  };

  return <MatchmakingContext.Provider value={value}>{children}</MatchmakingContext.Provider>;
}

export function useMatchmaking() {
  const context = useContext(MatchmakingContext);
  if (context === undefined) {
    throw new Error('useMatchmaking must be used within a MatchmakingProvider');
  }
  return context;
}
