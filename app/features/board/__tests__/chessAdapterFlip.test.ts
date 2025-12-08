import { ChessJsAdapter } from '@/core/utils/chess/adapters/chessjs-adapter';

describe('ChessJsAdapter flip behavior', () => {
  test('turn toggles after a move', () => {
    const chess = new ChessJsAdapter();
    expect(chess.turn()).toBe('w');

    // e4
    chess.move({ from: 'e2', to: 'e4' });
    expect(chess.turn()).toBe('b');

    // e5
    chess.move({ from: 'e7', to: 'e5' });
    expect(chess.turn()).toBe('w');
  });
});

