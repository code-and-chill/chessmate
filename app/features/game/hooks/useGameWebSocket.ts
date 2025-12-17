/**
 * Hook for WebSocket connection to game updates.
 * Manages connection lifecycle and provides real-time game state updates.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameWebSocket, ConnectionState, GameUpdateMessage } from '@/services/ws/GameWebSocket';
import type { GameState } from '@/features/board/hooks/useGameState';

export interface UseGameWebSocketOptions {
  gameId: string | null;
  authToken: string;
  enabled?: boolean; // Allow disabling WebSocket (fallback to polling)
  onUpdate?: (message: GameUpdateMessage) => void;
  onGameStateUpdate?: (gameState: Partial<GameState>) => void;
}

export interface UseGameWebSocketResult {
  connectionState: ConnectionState;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

/**
 * Hook for managing WebSocket connection to game updates
 */
export function useGameWebSocket({
  gameId,
  authToken,
  enabled = true,
  onUpdate,
  onGameStateUpdate,
}: UseGameWebSocketOptions): UseGameWebSocketResult {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const wsRef = useRef<GameWebSocket | null>(null);

  // Create WebSocket instance when gameId or authToken changes
  useEffect(() => {
    if (!gameId || !authToken || !enabled) {
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    // Create new WebSocket instance
    const ws = new GameWebSocket(gameId, authToken);
    wsRef.current = ws;

    // Subscribe to connection state changes
    const unsubscribeState = ws.onStateChange((state) => {
      setConnectionState(state);
    });

    // Subscribe to game updates
    const unsubscribeUpdate = ws.onUpdate((message) => {
      // Call custom update handler if provided
      if (onUpdate) {
        onUpdate(message);
      }

      // Handle different message types
      if (message.type === 'move_played' && message.move && onGameStateUpdate) {
        // Update game state from move message
        onGameStateUpdate({
          fen: message.fen || message.move.fen_after,
          moves: [], // Will be updated from full game state
        });
      } else if (message.type === 'game_ended' && onGameStateUpdate) {
        // Update game state from game ended message
        onGameStateUpdate({
          status: 'ended' as const,
          result: message.result as any,
          endReason: message.end_reason || '',
        });
      }
    });

    // Connect
    ws.connect();

    // Cleanup on unmount or dependency change
    return () => {
      unsubscribeState();
      unsubscribeUpdate();
      ws.disconnect();
      wsRef.current = null;
    };
  }, [gameId, authToken, enabled, onUpdate, onGameStateUpdate]);

  const connect = useCallback(() => {
    if (wsRef.current && connectionState !== 'connected') {
      wsRef.current.connect();
    }
  }, [connectionState]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
  }, []);

  return {
    connectionState,
    connect,
    disconnect,
    isConnected: connectionState === 'connected',
  };
}
