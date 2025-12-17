import { renderHook, waitFor } from '@testing-library/react';
import { useBotMove } from '../hooks/useBotMove';
import type { GameState } from '@/features/board/hooks/useGameState';

// Mock the API client
const mockGetGame = jest.fn();
const mockOnGameUpdate = jest.fn();

const createMockGameState = (overrides?: Partial<GameState>): GameState => ({
  status: 'in_progress',
  players: ['Player 1', 'Player 2'],
  moves: [],
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  sideToMove: 'w',
  endReason: '',
  result: null,
  lastMove: null,
  capturedByWhite: [],
  capturedByBlack: [],
  ...overrides,
});

describe('useBotMove', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not poll if not a bot game', () => {
    const { result } = renderHook(() =>
      useBotMove({
        gameId: 'test-game-id',
        gameState: createMockGameState(),
        isBotGame: false,
        isBotTurn: false,
        onGameUpdate: mockOnGameUpdate,
        getGame: mockGetGame,
      })
    );

    expect(result.current.isBotThinking).toBe(false);
    expect(mockGetGame).not.toHaveBeenCalled();
  });

  it('should start polling when bot turn is detected', async () => {
    const initialGameState = createMockGameState({
      botId: 'bot-medium-1200',
      botColor: 'b',
      sideToMove: 'b',
      moves: [{ moveNumber: 1, color: 'w', san: 'e4' }],
    });

    const { result } = renderHook(() =>
      useBotMove({
        gameId: 'test-game-id',
        gameState: initialGameState,
        isBotGame: true,
        isBotTurn: true,
        onGameUpdate: mockOnGameUpdate,
        getGame: mockGetGame,
      })
    );

    // Should start thinking
    expect(result.current.isBotThinking).toBe(true);

    // Mock bot move response
    const updatedGameState = createMockGameState({
      botId: 'bot-medium-1200',
      botColor: 'b',
      sideToMove: 'w', // Bot moved, now human's turn
      moves: [
        { moveNumber: 1, color: 'w', san: 'e4' },
        { moveNumber: 1, color: 'b', san: 'e5' },
      ],
    });

    mockGetGame.mockResolvedValue(updatedGameState);

    // Advance timers to trigger polling
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockGetGame).toHaveBeenCalled();
    });

    // After bot move detected, should stop thinking
    await waitFor(() => {
      expect(result.current.isBotThinking).toBe(false);
      expect(mockOnGameUpdate).toHaveBeenCalled();
    });
  });

  it('should stop thinking when bot turn ends', () => {
    const gameState = createMockGameState({
      botId: 'bot-medium-1200',
      botColor: 'b',
      sideToMove: 'w', // Not bot's turn
    });

    const { result, rerender } = renderHook(
      ({ isBotTurn }) =>
        useBotMove({
          gameId: 'test-game-id',
          gameState,
          isBotGame: true,
          isBotTurn,
          onGameUpdate: mockOnGameUpdate,
          getGame: mockGetGame,
        }),
      {
        initialProps: { isBotTurn: true },
      }
    );

    // Start with bot thinking
    expect(result.current.isBotThinking).toBe(true);

    // Change to not bot's turn
    rerender({ isBotTurn: false });

    // Should stop thinking
    expect(result.current.isBotThinking).toBe(false);
  });
});

