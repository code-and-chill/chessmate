import type { Board, Color } from '../types';
import type { MoveContext } from './move/types';
import { applyStrategy } from './move/runner';

export const toAlgebraic = (file: number, rank: number): string => {
  return String.fromCharCode(97 + file) + (rank + 1);
};

export const isLightSquare = (fileOrAlgebraic: number | string, rankArg?: number): boolean => {
  let file: number;
  let rank: number;
  if (typeof fileOrAlgebraic === 'string') {
    file = fileOrAlgebraic.charCodeAt(0) - 97;
    rank = parseInt(fileOrAlgebraic[1], 10) - 1;
  } else {
    file = fileOrAlgebraic;
    rank = (rankArg ?? 0);
  }
  return ((file + (rank + 1)) % 2) === 0;
};

export const fenToBoard = (fen: string): Board => {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const fenParts = fen.split(' ');
  const fenBoard = fenParts[0];
  const ranks = fenBoard.split('/');

  ranks.forEach((rankStr, fenRankIdx) => {
    const boardRankIdx = 7 - fenRankIdx;
    let fileIdx = 0;
    for (const char of rankStr) {
      if (/\d/.test(char)) {
        fileIdx += parseInt(char);
      } else {
        const color: Color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toUpperCase() as any;
        board[boardRankIdx][fileIdx] = { type, color } as any;
        fileIdx++;
      }
    }
  });

  return board;
};

export const boardToFen = (
  board: Board,
  sideToMove: Color = 'w',
  castling: string = '-',
  enPassant: string = '-',
  halfmoveClock: number = 0,
  fullmoveNumber: number = 1
): string => {
  const ranks: string[] = [];
  for (let r = 7; r >= 0; r--) {
    let empty = 0;
    let rankStr = '';
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) {
        empty++;
      } else {
        if (empty > 0) {
          rankStr += String(empty);
          empty = 0;
        }
        const ch = p.type;
        rankStr += p.color === 'w' ? ch : ch.toLowerCase();
      }
    }
    if (empty > 0) rankStr += String(empty);
    ranks.push(rankStr);
  }
  const boardPart = ranks.join('/');
  return `${boardPart} ${sideToMove} ${castling} ${enPassant} ${halfmoveClock} ${fullmoveNumber}`;
};

export const moveToFen = (fen: string, moveAlgebraic: string): string => {
  const fromFile = moveAlgebraic.charCodeAt(0) - 97;
  const fromRank = parseInt(moveAlgebraic[1], 10) - 1;
  const toFile = moveAlgebraic.charCodeAt(2) - 97;
  const toRank = parseInt(moveAlgebraic[3], 10) - 1;
  const promoChar = moveAlgebraic.length >= 5 ? moveAlgebraic[4] : undefined;

  const parts = fen.split(' ');
  // parts: [board, side, castling, enpassant, halfmove, fullmove]
  const sideToMove = parts[1] as Color;
  let castling = parts[2] ?? '-';
  let enPassant = parts[3] ?? '-';
  let halfmoveClockNum = parseInt(parts[4] ?? '0', 10);
  let fullmoveNumber = parseInt(parts[5] ?? '1', 10);

  // Use Piece-based Board representation
  const board = fenToBoard(fen);

  const moving = board[fromRank]?.[fromFile];
  const targetBefore = board[toRank]?.[toFile] ?? null;

  if (!moving) {
    // No piece to move: return original fen
    return fen;
  }

  const ctx = {
    board,
    from: { file: fromFile, rank: fromRank },
    to: { file: toFile, rank: toRank },
    sideToMove,
    enPassant: enPassant === '-' ? null : enPassant,
    castling: castling === '-' ? null : castling,
    promotion: promoChar ?? null,
  } as MoveContext;

  const result = applyStrategy(ctx);

  const didCapture = result?.didCapture ?? (targetBefore != null);
  const newEnPassant = result?.enPassant ?? '-';

  // Update castling rights when king/rook moves or rook captured
  const removeRight = (letter: string) => {
    if (castling === '-' || !castling.includes(letter)) return;
    castling = castling.replace(letter, '');
    if (castling === '') castling = '-';
  };

  if (moving.type === 'K') {
    if (moving.color === 'w') {
      removeRight('K');
      removeRight('Q');
    } else {
      removeRight('k');
      removeRight('q');
    }
  }

  if (moving.type === 'R') {
    if (moving.color === 'w' && fromRank === 0) {
      if (fromFile === 0) removeRight('Q');
      if (fromFile === 7) removeRight('K');
    }
    if (moving.color === 'b' && fromRank === 7) {
      if (fromFile === 0) removeRight('q');
      if (fromFile === 7) removeRight('k');
    }
  }

  if (targetBefore && targetBefore.type === 'R') {
    if (toRank === 0) {
      if (toFile === 0) removeRight('Q');
      if (toFile === 7) removeRight('K');
    }
    if (toRank === 7) {
      if (toFile === 0) removeRight('q');
      if (toFile === 7) removeRight('k');
    }
  }

  // Halfmove clock
  const isPawnMoveNow = moving.type === 'P';
  if (isPawnMoveNow || didCapture) {
    halfmoveClockNum = 0;
  } else {
    halfmoveClockNum = Math.max(0, halfmoveClockNum + 1);
  }

  // En-passant target square after a double pawn move
  enPassant = newEnPassant !== '-' ? newEnPassant : '-';

  const nextSide: Color = sideToMove === 'w' ? 'b' : 'w';
  if (sideToMove === 'b') {
    fullmoveNumber += 1;
  }

  return boardToFen(board, nextSide, castling, enPassant, halfmoveClockNum, fullmoveNumber);
};
