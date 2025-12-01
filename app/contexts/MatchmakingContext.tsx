/**
 * Matchmaking Context Provider - manages matchmaking queue and opponent finding.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApiClients } from './ApiContext';
import type { MatchFound } from '@/services/api/matchmaking.api';

// Re-export types for convenience
export type { MatchFound };

interface QueueEntry {
  userId: string;
  timeControl: string;
  ratingRange: {
    min: number;
    max: number;
  };
  joinedAt: string;
}

interface QueueStatus {
  playersInQueue: number;
  waitTime: number;
  averageWaitTime: number;
}

interface MatchmakingContextType {
  isInQueue: boolean;
  queueStatus: QueueStatus | null;
  matchFound: MatchFound | null;
  
  joinQueue: (options: { timeControl: string; ratingRange: { min: number; max: number } }) => Promise<void>;
  leaveQueue: () => Promise<void>;
  acceptMatch: () => Promise<void>;
  declineMatch: () => Promise<void>;
}

const MatchmakingContext = createContext<MatchmakingContextType | undefined>(undefined);

export function MatchmakingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { matchmakingApi } = useApiClients();
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [matchFound, setMatchFound] = useState<MatchFound | null>(null);
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [waitTimer, setWaitTimer] = useState(0);

  // Poll for match updates
  useEffect(() => {
    if (!isInQueue || !user) return;

    let isActive = true;

    const pollForMatch = async () => {
      try {
        const match = await matchmakingApi.pollForMatch(user.id, 30000);
        if (isActive && match) {
          setMatchFound(match);
          setIsInQueue(false);
        } else if (isActive && isInQueue) {
          // Continue polling if still in queue
          pollForMatch();
        }
      } catch (error) {
        console.error('Error polling for match:', error);
        // Retry after a delay
        if (isActive && isInQueue) {
          setTimeout(pollForMatch, 2000);
        }
      }
    };

    // Start polling
    pollForMatch();

    // Update wait timer and queue status
    const timerInterval = setInterval(() => {
      if (isActive && isInQueue) {
        setWaitTimer((prev) => prev + 1);
        // Update queue status periodically
        matchmakingApi.getQueueStatus(user.id).then((status) => {
          if (isActive && status.inQueue) {
            setQueueStatus({
              playersInQueue: status.position || 0,
              waitTime: waitTimer,
              averageWaitTime: status.estimatedWaitTime || 15,
            });
          }
        }).catch(console.error);
      }
    }, 1000);

    return () => {
      isActive = false;
      clearInterval(timerInterval);
    };
  }, [isInQueue, user, matchmakingApi, waitTimer]);

  const joinQueue = useCallback(
    async (options: { timeControl: string; ratingRange: { min: number; max: number } }) => {
      if (!user) throw new Error('User not authenticated');
      
      try {
        const entry: QueueEntry = {
          userId: user.id,
          timeControl: options.timeControl,
          ratingRange: options.ratingRange,
          joinedAt: new Date().toISOString(),
        };
        
        await matchmakingApi.joinQueue({
          userId: user.id,
          timeControl: options.timeControl,
          ratingRange: options.ratingRange,
        });
        
        setQueueEntry(entry);
        setIsInQueue(true);
        setWaitTimer(0);
        setMatchFound(null);
        
        console.log('Joined matchmaking queue:', entry);
      } catch (error) {
        console.error('Failed to join queue:', error);
        throw error;
      }
    },
    [user, matchmakingApi]
  );

  const leaveQueue = useCallback(async () => {
    if (!user) return;
    
    try {
      await matchmakingApi.leaveQueue(user.id);
      
      setIsInQueue(false);
      setQueueEntry(null);
      setQueueStatus(null);
      setWaitTimer(0);
      
      console.log('Left matchmaking queue');
    } catch (error) {
      console.error('Failed to leave queue:', error);
      throw error;
    }
  }, [user, matchmakingApi]);

  const acceptMatch = useCallback(async () => {
    if (!matchFound) throw new Error('No match to accept');
    
    try {
      console.log('Accepted match:', matchFound.gameId);
      
      // Match is accepted, context consumer should navigate to game
    } catch (error) {
      console.error('Failed to accept match:', error);
      throw error;
    }
  }, [matchFound]);

  const declineMatch = useCallback(async () => {
    if (!matchFound) throw new Error('No match to decline');
    if (!user) return;
    
    try {
      setMatchFound(null);
      
      console.log('Declined match');
      
      // Rejoin queue automatically
      if (queueEntry) {
        await matchmakingApi.joinQueue({
          userId: user.id,
          timeControl: queueEntry.timeControl,
          ratingRange: queueEntry.ratingRange,
        });
        setIsInQueue(true);
        setWaitTimer(0);
      }
    } catch (error) {
      console.error('Failed to decline match:', error);
      throw error;
    }
  }, [matchFound, queueEntry, user, matchmakingApi]);

  const value: MatchmakingContextType = {
    isInQueue,
    queueStatus,
    matchFound,
    joinQueue,
    leaveQueue,
    acceptMatch,
    declineMatch,
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
