import { fenToBoard, boardToFen, moveToFen } from '@/core/utils/chess/logic/parsing';
import { isKingInCheck } from '@/core/utils/chess/logic/validation';
import {describe, expect, test} from "@jest/globals";

describe('chess parsing and validation', () => {
  const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  test('parseFENToBoard and boardToFEN roundtrip for start position', () => {
    const board = fenToBoard(startFEN);
    // a1 should be white rook
    const a1 = board[0][0];
    expect(a1).toBeTruthy();
    expect(a1?.type).toBe('R');
    expect(a1?.color).toBe('w');

    const fenRound = boardToFen(board, 'w', 'KQkq', '-', 0, 1);
    expect(fenRound.startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')).toBe(true);
  });

  test('applyMoveToFENSimple moves pawn e2 to e4', () => {
    const newFen = moveToFen(startFEN, 'e2e4');
    const board = fenToBoard(newFen);
    // e4 => file 4, rank 3 (0-based)
    const e4 = board[3][4];
    expect(e4).toBeTruthy();
    expect(e4?.type).toBe('P');
    expect(e4?.color).toBe('w');
  });

  test('isKingInCheck detects rook check', () => {
    const fen = '4k3/8/8/8/8/8/4R3/4K3 w - - 0 1';
    const board = fenToBoard(fen);
    const blackInCheck = isKingInCheck(board, 'b');
    expect(blackInCheck).toBe(true);
  });
});

