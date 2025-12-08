import { jest } from '@jest/globals';
import { useChessEngine } from '@/features/board/hooks/useChessEngine';
import type { Board } from '@/core/utils/chess/types';

// We mock the ChessJsAdapter used by the hook so tests are deterministic.
jest.unstable_mockModule('@/core/utils/chess/adapters/chessjs-adapter', () => ({
  ChessJsAdapter: class {
    private fen: string | undefined;
    constructor(fen?: string) { this.fen = fen; }
    load(fen: string) { this.fen = fen; }
    fen() { return this.fen ?? ''; }
    moves(from?: string) {
      // return predictable verbose move objects
      if (!from) return [{ from: 'e2', to: 'e4', promotion: null }];
      if (from === 'e2') return [{ from: 'e2', to: 'e4', promotion: null }];
      return [];
    }
  }
}));

describe('useChessEngine hook (unit)', () => {
  test('getMoves maps chess.js verbose output to Move[]', () => {
    const hook = useChessEngine('');
    const board = Array(8).fill(null).map(() => Array(8).fill(null)) as Board;
    const moves = hook.getMoves(board, { file: 4, rank: 1 }, 'w');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0].from.file).toBe(4);
    expect(moves[0].to.file).toBe(4);
  });

  test('isValidMove returns true for an existing move', () => {
    const hook = useChessEngine('');
    const board = Array(8).fill(null).map(() => Array(8).fill(null)) as Board;
    const valid = hook.isValidMove(board, { file: 4, rank: 1 }, { file: 4, rank: 3 }, 'w');
    expect(valid).toBe(true);
  });
});

