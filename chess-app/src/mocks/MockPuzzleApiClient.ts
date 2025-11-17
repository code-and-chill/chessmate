/**
 * Mock implementation of PuzzleApiClient
 * Provides offline puzzle data for development and testing
 */

import type { PuzzleAttemptResponse } from '../api/puzzleApi';
import { PuzzleApiClient } from '../api/puzzleApi';
import {
  generateMockPuzzle,
  generateMockDailyPuzzle,
  generateMockPuzzleAttemptResponse,
  generateMockUserStats,
  generateMockUserHistory,
} from './mockData';

export class MockPuzzleApiClient extends PuzzleApiClient {
  constructor(
    baseUrl: string = 'http://mock-api',
    private simulateDelay: number = 500
  ) {
    super(baseUrl);
  }

  /**
   * Simulate network delay
   */
  private async delay(): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, this.simulateDelay + Math.random() * 200)
    );
  }

  /**
   * Get daily puzzle
   */
  async getDailyPuzzle() {
    await this.delay();
    return generateMockDailyPuzzle();
  }

  /**
   * Get puzzle by ID
   */
  async getPuzzle(puzzleId: string) {
    await this.delay();
    return generateMockPuzzle(puzzleId);
  }

  /**
   * Submit puzzle attempt
   */
  async submitAttempt(puzzleId: string): Promise<PuzzleAttemptResponse> {
    await this.delay();
    return generateMockPuzzleAttemptResponse(puzzleId);
  }

  /**
   * Get user puzzle stats
   */
  async getUserStats(userId: string) {
    await this.delay();
    return generateMockUserStats(userId);
  }

  /**
   * Get user puzzle history
   */
  async getUserHistory(userId: string, limit: number = 10) {
    await this.delay();
    return generateMockUserHistory(userId, limit);
  }
}
