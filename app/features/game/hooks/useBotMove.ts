import { useEffect, useRef, useState } from 'react';
import { useGetGame } from './useGetGame';
import type { GameState } from '@/features/board/hooks/useGameState';

interface UseBotMoveOptions {
  gameId: string | null;
  gameState: GameState | null;
  isBotGame: boolean;
  isBotTurn: boolean;
  onGameUpdate: (game: GameState) => void;
  enabled?: boolean; // Allow disabling polling (e.g., when WebSocket is available)
}

interface UseBotMoveResult {
  isBotThinking: boolean;
  botThinkingTime: number;
}

/**
 * Hook to handle bot moves in bot games.
 * Polls the game state after human moves to detect bot moves.
 * 
 * Refactored to use useGetGame hook instead of direct API calls.
 */
export function useBotMove({
  gameId,
  gameState,
  isBotGame,
  isBotTurn,
  onGameUpdate,
  enabled = true, // Default to enabled for backward compatibility
}: UseBotMoveOptions): UseBotMoveResult {
  const { game: fetchedGame, refetch: refetchGame } = useGetGame(gameId);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [botThinkingTime, setBotThinkingTime] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingStartRef = useRef<number | null>(null);
  const lastMoveCountRef = useRef<number>(0);

  // Update parent when fetched game changes
  useEffect(() => {
    if (fetchedGame) {
      const updatedMoveCount = fetchedGame?.moves?.length ?? 0;
      const currentMoveCount = gameState?.moves?.length ?? 0;
      
      // If move count increased, bot has moved
      if (updatedMoveCount > currentMoveCount) {
        setIsBotThinking(false);
        setBotThinkingTime(0);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        onGameUpdate(fetchedGame);
      }
    }
  }, [fetchedGame, gameState, onGameUpdate]);

  // Reset thinking state when game changes
  useEffect(() => {
    if (!gameId || !isBotGame || !enabled) {
      setIsBotThinking(false);
      setBotThinkingTime(0);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const currentMoveCount = gameState?.moves?.length ?? 0;
    
    // If it's bot's turn and we haven't started thinking yet, start polling
    // Start polling when it becomes bot's turn (after human move or game start)
    if (isBotTurn && !isBotThinking) {
      // Start polling if:
      // 1. Move count changed (human just moved, bot's turn now)
      // 2. This is the initial bot turn (game starts with bot)
      // 3. We haven't polled for this move count yet
      const moveCountChanged = currentMoveCount !== lastMoveCountRef.current;
      const isInitialBotTurn = currentMoveCount === 0 && gameState?.sideToMove === gameState?.botColor;
      
      if (moveCountChanged || isInitialBotTurn) {
        setIsBotThinking(true);
        thinkingStartRef.current = Date.now();
        lastMoveCountRef.current = currentMoveCount;

        // Poll for bot move every 500ms for up to 10 seconds
        let pollCount = 0;
        const maxPolls = 20; // 20 * 500ms = 10 seconds

        pollingIntervalRef.current = setInterval(async () => {
          pollCount++;
          
          try {
            if (!gameId) return;
            
            // Refetch game using use case
            await refetchGame();
            
            // Update thinking time
            if (thinkingStartRef.current) {
              const elapsed = Date.now() - thinkingStartRef.current;
              setBotThinkingTime(elapsed);
            }
            
            // Stop polling after max attempts
            if (pollCount >= maxPolls) {
              setIsBotThinking(false);
              setBotThinkingTime(0);
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
            }
          } catch (error) {
            console.error('Failed to poll for bot move:', error);
            // Continue polling on error
          }
        }, 500);
      }
    }

    // If it's not bot's turn anymore, stop thinking
    if (!isBotTurn && isBotThinking) {
      setIsBotThinking(false);
      setBotThinkingTime(0);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [gameId, gameState, isBotGame, isBotTurn, isBotThinking, enabled, refetchGame]);

  return {
    isBotThinking,
    botThinkingTime,
  };
}
