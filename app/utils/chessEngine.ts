/**
 * Chess Engine Utilities
 * 
 * Core chess logic including:
 * - Board state analysis
 * - Check detection
 * - Move validation
 * - Checkmate detection
 */

export type Color = 'w' | 'b';
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Board = (Piece | null)[][];

/**
 * Find the king of a given color on the board
 */
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

/**
 * Check if a square is under attack by opponent pieces
 */
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

/**
 * Check if the king of a given color is in check
 */
export const isKingInCheck = (board: Board, color: Color): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor = color === 'w' ? 'b' : 'w';
  return isSquareAttackedBy(board, kingPos.file, kingPos.rank, opponentColor);
};

/**
 * Simulate a move and check if it leaves the king in check
 */
export const wouldMoveExposureKing = (
  board: Board,
  fromFile: number,
  fromRank: number,
  toFile: number,
  toRank: number,
  pieceColor: Color
): boolean => {
  // Create a copy of the board
  const testBoard: Board = board.map(row => [...row]);
  
  // Apply the move
  testBoard[toRank][toFile] = testBoard[fromRank][fromFile];
  testBoard[fromRank][fromFile] = null;
  
  // Check if the king is now in check
  return isKingInCheck(testBoard, pieceColor);
};

/**
 * Get all legal moves for a piece (moves that don't expose the king to check)
 */
export const getLegalMoves = (
  board: Board,
  fromFile: number,
  fromRank: number,
  piece: Piece
): Array<{ file: number; rank: number }> => {
  const legalMoves: Array<{ file: number; rank: number }> = [];

  // Helper to check if a move is legal
  const checkLegalMove = (toFile: number, toRank: number) => {
    if (toFile < 0 || toFile >= 8 || toRank < 0 || toRank >= 8) return;
    
    const targetPiece = board[toRank][toFile];
    if (targetPiece && targetPiece.color === piece.color) return;
    
    if (!wouldMoveExposureKing(board, fromFile, fromRank, toFile, toRank, piece.color)) {
      legalMoves.push({ file: toFile, rank: toRank });
    }
  };

  // Generate all possible moves based on piece type
  if (piece.type === 'P') {
    const direction = piece.color === 'w' ? 1 : -1;
    const startRank = piece.color === 'w' ? 1 : 6;

    // Move forward one square
    const oneForward = fromRank + direction;
    if (oneForward >= 0 && oneForward < 8 && !board[oneForward][fromFile]) {
      checkLegalMove(fromFile, oneForward);
    }

    // Move forward two squares from start
    if (fromRank === startRank) {
      const twoForward = fromRank + 2 * direction;
      if (!board[oneForward][fromFile] && !board[twoForward][fromFile]) {
        checkLegalMove(fromFile, twoForward);
      }
    }

    // Capture diagonally
    for (const df of [-1, 1]) {
      const captureFile = fromFile + df;
      const captureRank = oneForward;
      if (captureFile >= 0 && captureFile < 8 && captureRank >= 0 && captureRank < 8) {
        const targetPiece = board[captureRank][captureFile];
        if (targetPiece && targetPiece.color !== piece.color) {
          checkLegalMove(captureFile, captureRank);
        }
      }
    }
  } else if (piece.type === 'N') {
    const knightMoves = [
      [2, 1], [2, -1], [-2, 1], [-2, -1],
      [1, 2], [1, -2], [-1, 2], [-1, -2],
    ];
    for (const [df, dr] of knightMoves) {
      checkLegalMove(fromFile + df, fromRank + dr);
    }
  } else if (piece.type === 'B') {
    const diagonals = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [df, dr] of diagonals) {
      for (let i = 1; i < 8; i++) {
        const toFile = fromFile + df * i;
        const toRank = fromRank + dr * i;
        if (toFile < 0 || toFile >= 8 || toRank < 0 || toRank >= 8) break;
        const targetPiece = board[toRank][toFile];
        if (targetPiece && targetPiece.color === piece.color) break;
        checkLegalMove(toFile, toRank);
        if (targetPiece) break;
      }
    }
  } else if (piece.type === 'R') {
    const straights = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [df, dr] of straights) {
      for (let i = 1; i < 8; i++) {
        const toFile = fromFile + df * i;
        const toRank = fromRank + dr * i;
        if (toFile < 0 || toFile >= 8 || toRank < 0 || toRank >= 8) break;
        const targetPiece = board[toRank][toFile];
        if (targetPiece && targetPiece.color === piece.color) break;
        checkLegalMove(toFile, toRank);
        if (targetPiece) break;
      }
    }
  } else if (piece.type === 'Q') {
    const allDirections = [
      [1, 1], [1, -1], [-1, 1], [-1, -1],
      [1, 0], [-1, 0], [0, 1], [0, -1],
    ];
    for (const [df, dr] of allDirections) {
      for (let i = 1; i < 8; i++) {
        const toFile = fromFile + df * i;
        const toRank = fromRank + dr * i;
        if (toFile < 0 || toFile >= 8 || toRank < 0 || toRank >= 8) break;
        const targetPiece = board[toRank][toFile];
        if (targetPiece && targetPiece.color === piece.color) break;
        checkLegalMove(toFile, toRank);
        if (targetPiece) break;
      }
    }
  } else if (piece.type === 'K') {
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        checkLegalMove(fromFile + df, fromRank + dr);
      }
    }
  }

  return legalMoves;
};

/**
 * Check if a side has any legal moves
 */
export const hasLegalMoves = (board: Board, color: Color): boolean => {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(board, file, rank, piece);
        if (moves.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * Check if a color is in checkmate
 */
export const isCheckmate = (board: Board, color: Color): boolean => {
  return isKingInCheck(board, color) && !hasLegalMoves(board, color);
};

/**
 * Check if a color is in stalemate (draw)
 */
export const isStalemate = (board: Board, color: Color): boolean => {
  return !isKingInCheck(board, color) && !hasLegalMoves(board, color);
};
