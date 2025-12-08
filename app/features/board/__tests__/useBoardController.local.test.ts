// Mock react-native Platform to avoid loading actual native module in Jest
jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: async () => {},
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));

// Mock engine internals (ChessJsAdapter used by useChessEngine)
jest.mock('@/core/utils/chess/adapters/chessjs-adapter', () => ({
  ChessJsAdapter: class {
    constructor() {}
    load() {}
    moves() { return [{ from: 'e2', to: 'e4', promotion: null }]; }
    fen() { return ''; }
  }
}));

import { useBoardController } from '@/features/board/hooks/useBoardController';
import type { Board } from '@/core/utils/chess/types';

describe('useBoardController local mode', () => {
  test('calls onMove when selecting a piece and target square (local)', () => {
    const board = Array(8).fill(null).map(() => Array(8).fill(null)) as Board;

    // place a mock piece at e2 (file=4, rank=1)
    board[1][4] = { type: 'P', color: 'w' } as any;

    const onMove = jest.fn();

    const opts = { board, fen: '', sideToMove: 'w', myColor: 'w', isLocalGame: true, isInteractive: true, animateMovements: false, reduceMotion: true, onMove } as any;

    const controller = useBoardController(opts);
    // select e2
    controller.handleSquarePress(4, 1);
    // attempt move to e4
    controller.handleSquarePress(4, 3);

    expect(onMove).toHaveBeenCalled();
  });
});
