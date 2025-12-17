/**
 * usePositionAnalysis Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { usePositionAnalysis } from '../usePositionAnalysis';
import { EngineApiClient, MockEngineApiClient } from '@/services/api';
import { useApiConfig, useMockApi } from '@/config/hooks';

// Mock config hooks
jest.mock('@/config/hooks', () => ({
  useApiConfig: jest.fn(),
  useMockApi: jest.fn(),
}));

// Mock the API clients
jest.mock('@/services/api', () => ({
  EngineApiClient: jest.fn(),
  MockEngineApiClient: jest.fn(),
}));

describe('usePositionAnalysis', () => {
  const mockEvaluatePosition = jest.fn();
  const mockApiConfig = {
    engineClusterUrl: 'http://localhost:9000',
    baseUrl: 'http://localhost:8000',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useApiConfig as jest.Mock).mockReturnValue(mockApiConfig);
    (useMockApi as jest.Mock).mockReturnValue(false);
    (EngineApiClient as jest.Mock).mockImplementation(() => ({
      evaluatePosition: mockEvaluatePosition,
    }));
  });

  it('should return initial state when fen is null', () => {
    const { result } = renderHook(() => usePositionAnalysis(null));

    expect(result.current.candidates).toEqual([]);
    expect(result.current.evaluation).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should analyze position when fen is provided', async () => {
    const mockResponse = {
      candidates: [
        { move: 'e2e4', eval: 0.25, depth: 12, pv: ['e2e4'] },
      ],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      time_ms: 450,
    };

    mockEvaluatePosition.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() =>
      usePositionAnalysis('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
        debounceMs: 0, // Disable debounce for testing
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.candidates).toHaveLength(1);
    expect(result.current.bestMove?.move).toBe('e2e4');
    expect(result.current.evaluation).toBe(25); // 0.25 * 100
  });

  it('should cache results for same FEN', async () => {
    const mockResponse = {
      candidates: [{ move: 'e2e4', eval: 0.25, depth: 12 }],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      time_ms: 450,
    };

    mockEvaluatePosition.mockResolvedValue(mockResponse);

    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    const { result, rerender } = renderHook(
      ({ fen }) => usePositionAnalysis(fen, { debounceMs: 0 }),
      { initialProps: { fen } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockEvaluatePosition).toHaveBeenCalledTimes(1);

    // Change FEN and back - should use cache
    rerender({ fen: 'different' });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    rerender({ fen });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should still be called only once (cached)
    expect(mockEvaluatePosition).toHaveBeenCalledTimes(1);
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Network error');
    mockEvaluatePosition.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      usePositionAnalysis('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
        debounceMs: 0,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.candidates).toEqual([]);
  });

  it('should use mock client when mockApi is true', () => {
    (useMockApi as jest.Mock).mockReturnValue(true);
    (MockEngineApiClient as jest.Mock).mockImplementation(() => ({
      evaluatePosition: mockEvaluatePosition,
    }));

    renderHook(() => usePositionAnalysis('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'));

    expect(MockEngineApiClient).toHaveBeenCalled();
    expect(EngineApiClient).not.toHaveBeenCalled();
  });

  it('should respect enabled flag', async () => {
    const { result } = renderHook(() =>
      usePositionAnalysis('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
        enabled: false,
        debounceMs: 0,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockEvaluatePosition).not.toHaveBeenCalled();
    expect(result.current.candidates).toEqual([]);
  });
});
