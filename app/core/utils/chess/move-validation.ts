/**
 * Chess Move Validation
 * 
 * Legal move validation for all chess pieces including:
 * - Pawn moves (including en passant)
 * - Knight moves
 * - Bishop moves
 * - Rook moves
 * - Queen moves
 * - King moves (including castling)
 */

import { isKingInCheck, wouldMoveExposureKing } from './engine';
import type { Board, Piece } from './engine';

export interface LastMove {
  from: string;
  to: string;
}

/**
 * Check if a pawn move is valid
 */
export const isValidPawnMove = (
  board: Board,
  fromFile: number,
  fromRank: number,
  toFile: number,
  toRank: number,
  piece: Piece,
  lastMove: LastMove | null
): boolean => {
  const direction = piece.color === 'w' ? 1 : -1;
  const startRank = piece.color === 'w' ? 1 : 6;
  const isStartingPosition = fromRank === startRank;

  // Same file (forward move)
  if (fromFile === toFile) {
    // One square forward
    if (toRank === fromRank + direction) {
      return !board[toRank][toFile];
    }
    // Two squares forward from starting position
    if (
      isStartingPosition &&
      toRank === fromRank + direction * 2 &&
      !board[fromRank + direction][fromFile] &&
      !board[toRank][toFile]
    ) {
      return true;
    }
  }

  // Diagonal capture
  if (Math.abs(fromFile - toFile) === 1 && toRank === fromRank + direction) {
    // Normal capture
    if (board[toRank][toFile]) {
      return true;
    }
    
    // En passant
    const enPassantRank = piece.color === 'w' ? 4 : 3;
    if (fromRank === enPassantRank && lastMove) {
      const adjacentPiece = board[fromRank][toFile];
      if (adjacentPiece?.type === 'P' && adjacentPiece.color !== piece.color) {
        const lastFromFile = lastMove.from.charCodeAt(0) - 97;
        const lastFromRank = parseInt(lastMove.from[1]) - 1;
        const lastToFile = lastMove.to.charCodeAt(0) - 97;
        const lastToRank = parseInt(lastMove.to[1]) - 1;
        
        if (lastToFile === toFile && 
            lastFromFile === toFile && 
            Math.abs(lastToRank - lastFromRank) === 2) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Check if a knight move is valid
 */
export const isValidKnightMove = (
  fromFile: number,
  fromRank: number,
  toFile: number,
  toRank: number
): boolean => {
  const fileDiff = Math.abs(fromFile - toFile);
  const rankDiff = Math.abs(fromRank - toRank);
  return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
};

/**
 * Check if a bishop move is valid
 */
export const isValidBishopMove = (
  board: Board,
  fromFile: number,
  fromRank: number,
  toFile: number,
  toRank: number
): boolean => {
  const fileDiff = Math.abs(fromFile - toFile);
  const rankDiff = Math.abs(fromRank - toRank);
  if (fileDiff !== rankDiff || fileDiff === 0) return false;

  const fileDir = toFile > fromFile ? 1 : -1;
  const rankDir = toRank > fromRank ? 1 : -1;
  let f = fromFile + fileDir;
  let r = fromRank + rankDir;
  while (f !== toFile) {
    if (board[r][f]) return false;
    f += fileDir;
    r += rankDir;
  }
  return true;
};

/**
 * Check if a rook move is valid
 */
export const isValidRookMove = (
  board: Board,
  fromFile: number,
  fromRank: number,
  toFile: number,
  toRank: number
): boolean => {
  if (fromFile !== toFile && fromRank !== toRank) return false;

  if (fromFile === toFile) {
    const rankDir = toRank > fromRank ? 1 : -1;
    for (let r = fromRank + rankDir; r !== toRank; r += rankDir) {
      if (board[r][fromFile]) return false;
    }
  } else {
    const fileDir = toFile > fromFile ? 1 : -1;
    for (let f = fromFile + fileDir; f !== toFile; f += fileDir) {
      if (board[fromRank][f]) return false;
    }
  }
  return true;
};

/**
 * Check if a queen move is valid
 */
export const isValidQueenMove = (
  board: Board,
  fromFile: number,
  fromRank: number,
  toFile: number,
  toRank: number
): boolean => {
  return (
    isValidRookMove(board, fromFile, fromRank, toFile, toRank) ||
    isValidBishopMove(board, fromFile, fromRank, toFile, toRank)
  );
};

/**
 * Check if a king move is valid
 */
export const isValidKingMove = (
  board: Board,
  fromFile: number,
  fromRank: number,
  toFile: number,
  toRank: number
): boolean => {
  // Normal king move (one square in any direction)
  if (Math.abs(fromFile - toFile) <= 1 && Math.abs(fromRank - toRank) <= 1) {
    return true;
  }
  
  // Castling: king moves two squares horizontally
  if (fromRank === toRank && Math.abs(fromFile - toFile) === 2) {
    const kingPiece = board[fromRank][fromFile];
    if (!kingPiece) return false;
    
    const isKingside = toFile > fromFile;
    const rookFile = isKingside ? 7 : 0;
    const rook = board[fromRank][rookFile];
    
    // Check if rook exists and is same color
    if (!rook || rook.type !== 'R' || rook.color !== kingPiece.color) {
      return false;
    }
    
    // Check if squares between king and rook are empty
    const startFile = Math.min(fromFile, rookFile);
    const endFile = Math.max(fromFile, rookFile);
    for (let f = startFile + 1; f < endFile; f++) {
      if (board[fromRank][f]) {
        return false;
      }
    }
    
    // King cannot castle out of check
    if (isKingInCheck(board, kingPiece.color)) {
      return false;
    }
    
    // King cannot castle through check (check intermediate square)
    const intermediateFile = isKingside ? fromFile + 1 : fromFile - 1;
    const testBoard = JSON.parse(JSON.stringify(board));
    testBoard[fromRank][intermediateFile] = kingPiece;
    testBoard[fromRank][fromFile] = null;
    if (isKingInCheck(testBoard, kingPiece.color)) {
      return false;
    }
    
    // King cannot castle into check (checked by normal move validation)
    return true;
  }
  
  return false;
};

/**
 * Check if a move is valid for the given piece, including:
 * - Basic piece movement rules
 * - Can't capture own pieces
 * - Can't leave king in check
 * - Must resolve check if in check
 */
export const isValidMove = (
  board: Board,
  fromFile: number,
  fromRank: number,
  toFile: number,
  toRank: number,
  piece: Piece,
  lastMove?: LastMove
): boolean => {
  // Can't move to same square
  if (fromFile === toFile && fromRank === toRank) return false;

  // Can't capture own piece
  const targetSquare = board[toRank][toFile];
  if (targetSquare && targetSquare.color === piece.color) return false;

  // Check basic move validity based on piece type
  let isMoveValid = false;
  
  switch (piece.type) {
    case 'P':
      isMoveValid = isValidPawnMove(board, fromFile, fromRank, toFile, toRank, piece, lastMove);
      break;
    case 'N':
      isMoveValid = isValidKnightMove(fromFile, fromRank, toFile, toRank);
      break;
    case 'B':
      isMoveValid = isValidBishopMove(board, fromFile, fromRank, toFile, toRank);
      break;
    case 'R':
      isMoveValid = isValidRookMove(board, fromFile, fromRank, toFile, toRank);
      break;
    case 'Q':
      isMoveValid = isValidQueenMove(board, fromFile, fromRank, toFile, toRank);
      break;
    case 'K':
      isMoveValid = isValidKingMove(board, fromFile, fromRank, toFile, toRank);
      break;
    default:
      isMoveValid = false;
  }

  if (!isMoveValid) return false;

  // If king is in check, verify the move resolves it
  // Otherwise, verify move doesn't expose king
  if (wouldMoveExposureKing(board, fromFile, fromRank, toFile, toRank, piece.color)) {
    return false;
  }

  return true;
};
