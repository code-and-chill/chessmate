/**
 * Engine API Client Tests
 */

import { EngineApiClient, MockEngineApiClient } from '../engine.api';

// Mock fetch globally
global.fetch = jest.fn();

describe('EngineApiClient', () => {
  const baseUrl = 'http://localhost:9000';
  let client: EngineApiClient;

  beforeEach(() => {
    client = new EngineApiClient(baseUrl);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('evaluatePosition', () => {
    it('should evaluate a position successfully', async () => {
      const mockResponse = {
        candidates: [
          { move: 'e2e4', eval: 0.25, depth: 12, pv: ['e2e4', 'c7c5'] },
          { move: 'd2d4', eval: 0.20, depth: 12, pv: ['d2d4', 'd7d5'] },
        ],
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        time_ms: 450,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.evaluatePosition({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        side_to_move: 'w',
        max_depth: 12,
        time_limit_ms: 1000,
        multi_pv: 2,
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/evaluate`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            side_to_move: 'w',
            max_depth: 12,
            time_limit_ms: 1000,
            multi_pv: 2,
          }),
        })
      );
    });

    it('should use default values when options are not provided', async () => {
      const mockResponse = {
        candidates: [{ move: 'e2e4', eval: 0.25, depth: 12 }],
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        time_ms: 450,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.evaluatePosition({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        side_to_move: 'w',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/evaluate`,
        expect.objectContaining({
          body: JSON.stringify({
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            side_to_move: 'w',
            max_depth: 12,
            time_limit_ms: 1000,
            multi_pv: 1,
          }),
        })
      );
    });

    it('should throw error on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      await expect(
        client.evaluatePosition({
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          side_to_move: 'w',
        })
      ).rejects.toThrow('Engine API error');
    });
  });

  describe('healthCheck', () => {
    it('should check health successfully', async () => {
      const mockResponse = {
        status: 'ok',
        service: 'engine-cluster-api',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.healthCheck();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/health`,
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });
});

describe('MockEngineApiClient', () => {
  let client: MockEngineApiClient;

  beforeEach(() => {
    client = new MockEngineApiClient();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('evaluatePosition', () => {
    it('should return mock candidates', async () => {
      const promise = client.evaluatePosition({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        side_to_move: 'w',
        max_depth: 12,
        time_limit_ms: 1000,
        multi_pv: 2,
      });

      jest.advanceTimersByTime(200);

      const result = await promise;

      expect(result.candidates).toHaveLength(2);
      expect(result.candidates[0]).toHaveProperty('move');
      expect(result.candidates[0]).toHaveProperty('eval');
      expect(result.candidates[0]).toHaveProperty('depth');
      expect(result.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(result.time_ms).toBeLessThanOrEqual(200);
    });

    it('should respect time limit', async () => {
      const promise = client.evaluatePosition({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        side_to_move: 'w',
        time_limit_ms: 50,
      });

      jest.advanceTimersByTime(50);

      const result = await promise;
      expect(result.time_ms).toBeLessThanOrEqual(50);
    });
  });

  describe('healthCheck', () => {
    it('should return mock health status', async () => {
      const result = await client.healthCheck();

      expect(result).toEqual({
        status: 'ok',
        service: 'engine-cluster-api',
      });
    });
  });
});
