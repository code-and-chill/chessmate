import type { Board, Color } from '../types';
import { ChessJsAdapter } from '@/core/utils/chess';
import { fenToBoard, boardToFen, moveToFen } from './parsing';

export const move = (
  fenOrBoard: string | Board,
  from: string,
  to: string,
  promotion: string | null = null,
  options?: { sideToMove?: Color; castlingRights?: string | null; enPassantTarget?: string | null; halfmoveClock?: number; fullmoveNumber?: number }
): { fen: string; board: Board } => {
  let fen: string;
  if (typeof fenOrBoard === 'string') {
    // For a FEN string, prefer chess.js for full rule compliance
    const adapter = new ChessJsAdapter(fenOrBoard);
    adapter.move({ from, to, promotion: promotion ?? undefined });
    const newFen = adapter.fen();
    const newBoard = fenToBoard(newFen);
    return { fen: newFen, board: newBoard };
  }

  // If a Board is provided, prefer our strategy-based applier for speed and transparency
  fen = boardToFen(
    fenOrBoard,
    options?.sideToMove ?? 'w',
    options?.castlingRights ?? '-',
    options?.enPassantTarget ?? '-',
    options?.halfmoveClock ?? 0,
    options?.fullmoveNumber ?? 1
  );

  const algebraic = from + to + (promotion ?? '');
  try {
    const newFen = moveToFen(fen, algebraic);
    const newBoard = fenToBoard(newFen);
    return { fen: newFen, board: newBoard };
  } catch (e) {
    // Fallback to chess.js if our simple applier fails
    const adapter = new ChessJsAdapter(fen);
    adapter.move({ from, to, promotion: promotion ?? undefined });
    const newFen = adapter.fen();
    const newBoard = fenToBoard(newFen);
    return { fen: newFen, board: newBoard };
  }
};
