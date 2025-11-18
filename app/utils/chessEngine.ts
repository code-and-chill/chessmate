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
 * Parse a FEN string into a Board of Piece objects
 * board[0] corresponds to rank 1 (white's back rank is at index 0)
 */
export const parseFENToBoard = (fen: string): Board => {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const fenParts = fen.split(' ');
  const fenBoard = fenParts[0];
  const ranks = fenBoard.split('/');

  ranks.forEach((rankStr, fenRankIdx) => {
    // FEN rank 0 = board rank 7, FEN rank 7 = board rank 0
    const boardRankIdx = 7 - fenRankIdx;
    let fileIdx = 0;
    for (const char of rankStr) {
      if (/\d/.test(char)) {
        fileIdx += parseInt(char);
      } else {
        const color: Color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toUpperCase() as PieceType;
        board[boardRankIdx][fileIdx] = { type, color };
        fileIdx++;
      }
    }
  });

  return board;
};

/**
 * Apply a basic move to a FEN position using long algebraic like "e2e4".
 * Notes:
 * - This is intentionally simple: no castling, promotion, or en passant rules.
 * - Updates piece placement, flips side-to-move, and bumps fullmove count when black just moved.
 */
export const applyMoveToFENSimple = (fen: string, moveAlgebraic: string): string => {
  const fromFile = moveAlgebraic.charCodeAt(0) - 97; // a=0
  const fromRank = parseInt(moveAlgebraic[1], 10) - 1; // 1=0
  const toFile = moveAlgebraic.charCodeAt(2) - 97;
  const toRank = parseInt(moveAlgebraic[3], 10) - 1;
  const promoChar = moveAlgebraic.length >= 5 ? moveAlgebraic[4] : undefined;

  const parts = fen.split(' ');
  const boardPart = parts[0];
  const sideToMove = parts[1] as Color; // 'w' | 'b'
  let castling = parts[2] ?? '-';
  let enPassant = parts[3] ?? '-';
  let halfmoveClockNum = parseInt(parts[4] ?? '0', 10);
  let fullmoveNumber = parseInt(parts[5] ?? '1', 10);

  // Build a mutable board of piece characters
  const ranks = boardPart.split('/');
  const board: (string | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  ranks.forEach((rankStr, fenRankIdx) => {
    const boardRankIdx = 7 - fenRankIdx;
    let fileIdx = 0;
    for (const ch of rankStr) {
      if (/\d/.test(ch)) {
        fileIdx += parseInt(ch, 10);
      } else {
        board[boardRankIdx][fileIdx] = ch;
        fileIdx++;
      }
    }
  });

  // Inspect moving and target pieces before mutation
  const moving = board[fromRank][fromFile];
  const targetBefore = board[toRank][toFile];

  const colorIsWhite = moving ? moving === moving.toUpperCase() : sideToMove === 'w';
  const pawnDirection = colorIsWhite ? 1 : -1;

  // Detect castling and move rook accordingly if king performs castle move
  const isKingMove = moving && moving.toUpperCase() === 'K';
  const isCastleKingside = isKingMove && fromFile === 4 && (colorIsWhite ? fromRank === 0 : fromRank === 7) && toFile === 6;
  const isCastleQueenside = isKingMove && fromFile === 4 && (colorIsWhite ? fromRank === 0 : fromRank === 7) && toFile === 2;

  if (isCastleKingside) {
    // Move rook from h-file to f-file
    const rRank = fromRank;
    board[rRank][5] = board[rRank][7];
    board[rRank][7] = null;
  } else if (isCastleQueenside) {
    // Move rook from a-file to d-file
    const rRank = fromRank;
    board[rRank][3] = board[rRank][0];
    board[rRank][0] = null;
  }

  // En passant capture: pawn moves diagonally to an empty target matching enPassant square
  let didCapture = false;
  if (moving && moving.toUpperCase() === 'P') {
    const fileDiff = Math.abs(toFile - fromFile);
    const targetEmpty = targetBefore == null;
    const algebraic = (f: number, r: number) => String.fromCharCode(97 + f) + (r + 1);

    if (fileDiff === 1 && targetEmpty && enPassant !== '-' && enPassant === algebraic(toFile, toRank)) {
      const capturedRank = toRank - pawnDirection;
      if (capturedRank >= 0 && capturedRank < 8) {
        if (board[capturedRank][toFile]) {
          board[capturedRank][toFile] = null;
          didCapture = true;
        }
      }
    }
  }

  // Move the piece with optional promotion
  if (moving) {
    let placed = moving;
    if (promoChar && moving.toUpperCase() === 'P') {
      const promoUpper = promoChar.toUpperCase();
      placed = colorIsWhite ? promoUpper : promoUpper.toLowerCase();
    }
    board[toRank][toFile] = placed;
  } else {
    board[toRank][toFile] = moving;
  }
  board[fromRank][fromFile] = null;

  // Determine if normal capture happened
  if (targetBefore) didCapture = true;

  // Update castling rights
  const removeRight = (letter: string) => {
    if (castling === '-' || !castling.includes(letter)) return;
    castling = castling.replace(letter, '');
    if (castling === '') castling = '-';
  };

  // If king moved, remove both rights for that color
  if (isKingMove) {
    if (colorIsWhite) {
      removeRight('K');
      removeRight('Q');
    } else {
      removeRight('k');
      removeRight('q');
    }
  }

  // If rook moved from initial square, drop that right
  const isRookMove = moving && moving.toUpperCase() === 'R';
  if (isRookMove) {
    if (colorIsWhite && fromRank === 0) {
      if (fromFile === 0) removeRight('Q');
      if (fromFile === 7) removeRight('K');
    }
    if (!colorIsWhite && fromRank === 7) {
      if (fromFile === 0) removeRight('q');
      if (fromFile === 7) removeRight('k');
    }
  }

  // If a rook was captured on its initial square, drop that right
  if (targetBefore && targetBefore.toUpperCase() === 'R') {
    if (toRank === 0) {
      if (toFile === 0) removeRight('Q');
      if (toFile === 7) removeRight('K');
    }
    if (toRank === 7) {
      if (toFile === 0) removeRight('q');
      if (toFile === 7) removeRight('k');
    }
  }

  // Rebuild boardPart
  const newBoardPart = board
    .map((rankArray) => {
      let s = '';
      let empty = 0;
      for (const sq of rankArray) {
        if (!sq) {
          empty++;
        } else {
          if (empty > 0) {
            s += empty;
            empty = 0;
          }
          s += sq;
        }
      }
      if (empty > 0) s += empty;
      return s;
    })
    .reverse()
    .join('/');

  // Halfmove clock: reset on pawn move or capture; else increment
  const isPawnMove = moving ? moving.toUpperCase() === 'P' : false;
  if (isPawnMove || didCapture) {
    halfmoveClockNum = 0;
  } else {
    halfmoveClockNum = Math.max(0, halfmoveClockNum + 1);
  }

  // En passant square: set only if a pawn moved two squares this move
  enPassant = '-';
  if (isPawnMove && Math.abs(toRank - fromRank) === 2) {
    const epRank = fromRank + pawnDirection; // square jumped over
    const epFile = fromFile;
    enPassant = String.fromCharCode(97 + epFile) + (epRank + 1);
  }

  // Flip side to move and update fullmove when black moved
  const nextSide: Color = sideToMove === 'w' ? 'b' : 'w';
  if (sideToMove === 'b') {
    fullmoveNumber += 1;
  }

  return `${newBoardPart} ${nextSide} ${castling} ${enPassant} ${halfmoveClockNum} ${fullmoveNumber}`;
};

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
