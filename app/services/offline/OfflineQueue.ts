/**
 * Offline queue for moves that fail due to network issues.
 * Persists moves to AsyncStorage and retries when network is restored.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = '@chess_move_queue';
const MAX_QUEUE_SIZE = 100;
const QUEUE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface QueuedMove {
  id: string;
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
  timestamp: number;
  retryCount: number;
}

export interface OfflineQueueOptions {
  maxQueueSize?: number;
  queueTtlMs?: number;
}

export class OfflineQueue {
  private maxQueueSize: number;
  private queueTtlMs: number;

  constructor(options: OfflineQueueOptions = {}) {
    this.maxQueueSize = options.maxQueueSize ?? MAX_QUEUE_SIZE;
    this.queueTtlMs = options.queueTtlMs ?? QUEUE_TTL_MS;
  }

  /**
   * Add a move to the offline queue
   */
  async enqueueMove(
    gameId: string,
    from: string,
    to: string,
    promotion?: string
  ): Promise<string> {
    const moveId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const queuedMove: QueuedMove = {
      id: moveId,
      gameId,
      from,
      to,
      promotion,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const queue = await this.getQueue();
    
    // Check queue size limit
    if (queue.length >= this.maxQueueSize) {
      throw new Error(`Queue is full (max ${this.maxQueueSize} moves)`);
    }

    queue.push(queuedMove);
    await this.saveQueue(queue);

    return moveId;
  }

  /**
   * Get all queued moves
   */
  async getQueue(): Promise<QueuedMove[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (!data) {
        return [];
      }

      const queue: QueuedMove[] = JSON.parse(data);
      
      // Clean up expired moves
      const now = Date.now();
      const validQueue = queue.filter(
        (move) => now - move.timestamp < this.queueTtlMs
      );

      if (validQueue.length !== queue.length) {
        await this.saveQueue(validQueue);
      }

      return validQueue;
    } catch (error) {
      console.error('Failed to get queue:', error);
      return [];
    }
  }

  /**
   * Remove a move from the queue (after successful submission)
   */
  async removeMove(moveId: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((move) => move.id !== moveId);
    await this.saveQueue(filtered);
  }

  /**
   * Clear all moves for a specific game
   */
  async clearGameMoves(gameId: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((move) => move.gameId !== gameId);
    await this.saveQueue(filtered);
  }

  /**
   * Clear the entire queue
   */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  /**
   * Increment retry count for a move
   */
  async incrementRetry(moveId: string): Promise<number> {
    const queue = await this.getQueue();
    const move = queue.find((m) => m.id === moveId);
    
    if (move) {
      move.retryCount++;
      await this.saveQueue(queue);
      return move.retryCount;
    }
    
    return 0;
  }

  /**
   * Get queue size
   */
  async size(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: QueuedMove[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save queue:', error);
      throw error;
    }
  }
}
