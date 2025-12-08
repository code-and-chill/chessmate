import { ChessJsAdapter } from '@/core/utils/chess/adapters/chessjs-adapter';

describe('local game orientation flip (engine smoke)', () => {
  it('flips engine turn after two moves', () => {
    const adapter = new ChessJsAdapter();

    expect(adapter.turn()).toBe('w');

    adapter.move({ from: 'e2', to: 'e4' });
    expect(adapter.turn()).toBe('b');

    adapter.move({ from: 'e7', to: 'e5' });
    expect(adapter.turn()).toBe('w');
  });
});
