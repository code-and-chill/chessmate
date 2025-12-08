import { moveToFen, fenToBoard } from '@/core/utils/chess/logic/parsing';
import { describe, expect, test } from '@jest/globals';

describe('move strategies (castling, en-passant, promotion)', () => {
  test('white kingside castling moves rook and king', () => {
    const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const newFen = moveToFen(startFen, 'e1g1');
    const board = fenToBoard(newFen);
    // king should be on g1 and rook on f1
    expect(board[0][6]?.type).toBe('K');
    expect(board[0][5]?.type).toBe('R');
  });

  test('e2e4 sets en-passant target to e3', () => {
    const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const newFen = moveToFen(startFen, 'e2e4');
    expect(newFen.split(' ')[3]).toBe('e3');
  });

  test('promotion replaces pawn with chosen piece', () => {
    const fen = '8/P7/8/8/8/8/8/7k w - - 0 1';
    const newFen = moveToFen(fen, 'a7a8q');
    const board = fenToBoard(newFen);
    expect(board[7][0]?.type).toBe('Q');
  });
});
