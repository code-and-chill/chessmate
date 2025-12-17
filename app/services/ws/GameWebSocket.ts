/**
 * WebSocket client for real-time game updates.
 * Provides connection management, reconnection, and event handling.
 */

import { getConfig } from '@/platform/environment';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export interface GameUpdateMessage {
  type: 'move_played' | 'game_ended' | 'connected' | 'ping' | 'pong';
  game_id?: string;
  move?: {
    ply: number;
    from_square: string;
    to_square: string;
    san: string;
    fen_after: string;
  };
  fen?: string;
  result?: string;
  end_reason?: string;
  connection_id?: string;
}

export type GameUpdateCallback = (message: GameUpdateMessage) => void;
export type ConnectionStateCallback = (state: ConnectionState) => void;

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private gameId: string;
  private authToken: string;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelays = [1000, 2000, 4000, 8000, 16000, 30000]; // Exponential backoff, max 30s
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private resumeToken: string | null = null;

  private updateCallbacks: Set<GameUpdateCallback> = new Set();
  private stateCallbacks: Set<ConnectionStateCallback> = new Set();

  constructor(gameId: string, authToken: string) {
    this.gameId = gameId;
    this.authToken = authToken;
  }

  /**
   * Subscribe to game update messages
   */
  onUpdate(callback: GameUpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(callback: ConnectionStateCallback): () => void {
    this.stateCallbacks.add(callback);
    // Return unsubscribe function
    return () => {
      this.stateCallbacks.delete(callback);
    };
  }

  /**
   * Connect to WebSocket
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      return; // Already connecting
    }

    this.setState('connecting');
    
    try {
      const config = getConfig();
      const wsUrl = `${config.websocketUrl}/games/${this.gameId}?token=${encodeURIComponent(this.authToken)}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setState('connected');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: GameUpdateMessage = JSON.parse(event.data);
          
          // Handle ping/pong
          if (message.type === 'ping') {
            this.send({ type: 'pong' });
            return;
          }

          // Store resume token if provided
          if (message.type === 'connected' && message.connection_id) {
            this.resumeToken = message.connection_id;
          }

          // Notify all subscribers
          this.updateCallbacks.forEach(callback => {
            try {
              callback(message);
            } catch (error) {
              console.error('Error in update callback:', error);
            }
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        this.setState('disconnected');
        this.stopHeartbeat();
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.setState('disconnected');
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.setState('disconnected');
    this.reconnectAttempts = 0;
  }

  /**
   * Send message to WebSocket
   */
  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  /**
   * Set connection state and notify subscribers
   */
  private setState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.stateCallbacks.forEach(callback => {
        try {
          callback(state);
        } catch (error) {
          console.error('Error in state callback:', error);
        }
      });
    }
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Start heartbeat (ping) to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    const config = getConfig();
    // Use environment timeout or default to 30s
    const interval = 30000; // 30 seconds
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, interval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelays[Math.min(this.reconnectAttempts, this.reconnectDelays.length - 1)];
    this.reconnectAttempts++;
    
    this.setState('reconnecting');
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);
      this.connect();
    }, delay);
  }

  /**
   * Get resume token for reconnection
   */
  getResumeToken(): string | null {
    return this.resumeToken;
  }
}
