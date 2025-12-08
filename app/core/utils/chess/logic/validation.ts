import type { Board, Color } from '../types';

export const findKing = (board: Board, color: Color): { file: number; rank: number } | null => {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.type === 'K' && piece.color === color) {
        return { file, rank };
      }
    }
  }
  return null;
};

export const isSquareAttackedBy = (
  board: Board,
  file: number,
  rank: number,
  attackerColor: Color
): boolean => {
  // Check for pawn attacks
  const pawnDirection = attackerColor === 'w' ? 1 : -1;
  const pawnAttackRank = rank - pawnDirection;

  if (pawnAttackRank >= 0 && pawnAttackRank < 8) {
    for (let f = Math.max(0, file - 1); f <= Math.min(7, file + 1); f++) {
      if (f === file) continue;
      const piece = board[pawnAttackRank][f];
      if (piece?.type === 'P' && piece.color === attackerColor) {
        return true;
      }
    }
  }

  // Check for knight attacks
  const knightMoves = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2],
  ];

  for (const [df, dr] of knightMoves) {
    const nf = file + df;
    const nr = rank + dr;
    if (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) {
      const piece = board[nr][nf];
      if (piece?.type === 'N' && piece.color === attackerColor) {
        return true;
      }
    }
  }

  // Check for king attacks
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const kf = file + df;
      const kr = rank + dr;
      if (kf >= 0 && kf < 8 && kr >= 0 && kr < 8) {
        const piece = board[kr][kf];
        if (piece?.type === 'K' && piece.color === attackerColor) {
          return true;
        }
      }
    }
  }

  // Check for bishop/queen diagonal attacks
  const diagonals = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [df, dr] of diagonals) {
    for (let i = 1; i < 8; i++) {
      const bf = file + df * i;
      const br = rank + dr * i;
      if (bf < 0 || bf >= 8 || br < 0 || br >= 8) break;

      const piece = board[br][bf];
      if (piece) {
        if (piece.color === attackerColor && (piece.type === 'B' || piece.type === 'Q')) {
          return true;
        }
        break;
      }
    }
  }

  // Check for rook/queen straight attacks
  const straights = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [df, dr] of straights) {
    for (let i = 1; i < 8; i++) {
      const rf = file + df * i;
      const rr = rank + dr * i;
      if (rf < 0 || rf >= 8 || rr < 0 || rr >= 8) break;

      const piece = board[rr][rf];
      if (piece) {
        if (piece.color === attackerColor && (piece.type === 'R' || piece.type === 'Q')) {
          return true;
        }
        break;
      }
    }
  }

  return false;
};

export const isKingInCheck = (board: Board, color: Color): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor = color === 'w' ? 'b' : 'w';
  return isSquareAttackedBy(board, kingPos.file, kingPos.rank, opponentColor);
};

