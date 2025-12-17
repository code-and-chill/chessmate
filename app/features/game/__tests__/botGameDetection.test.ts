import { getGameParticipant } from '../utils/getGameParticipant';
import type { GameState } from '@/features/board/hooks/useGameState';

describe('Bot Game Detection', () => {
  const createGameState = (overrides?: Partial<GameState>): GameState => ({
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

  it('should detect bot game from botId', () => {
    const gameState = createGameState({
      botId: 'bot-medium-1200',
      botColor: 'b',
    });

    const isBotGame = !!(gameState.botId || gameState.isBotGame);
    expect(isBotGame).toBe(true);
  });

  it('should detect bot game from isBotGame flag', () => {
    const gameState = createGameState({
      isBotGame: true,
      botColor: 'b',
    });

    const isBotGame = !!(gameState.botId || gameState.isBotGame);
    expect(isBotGame).toBe(true);
  });

  it('should detect bot turn correctly', () => {
    const gameState = createGameState({
      botId: 'bot-medium-1200',
      botColor: 'b',
      sideToMove: 'b',
    });

    const isBotTurn = gameState.botColor === gameState.sideToMove;
    expect(isBotTurn).toBe(true);
  });

  it('should not detect bot turn when human turn', () => {
    const gameState = createGameState({
      botId: 'bot-medium-1200',
      botColor: 'b',
      sideToMove: 'w',
    });

    const isBotTurn = gameState.botColor === gameState.sideToMove;
    expect(isBotTurn).toBe(false);
  });

  it('should handle bot game participant detection', () => {
    const gameState = createGameState({
      botId: 'bot-medium-1200',
      botColor: 'b',
      players: ['human-player-id', 'bot-medium-1200'],
    });

    const participant = getGameParticipant(gameState as any, 'human-player-id', { id: 'human-player-id' });
    
    // Participant should be detected correctly
    expect(participant).not.toBeNull();
  });
});

