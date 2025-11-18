import React, { useState } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { defaultBoardConfig, type BoardConfig } from '@/components/config';
import { getBoardColors, type BoardTheme, type ThemeMode } from '@/components/config/themeConfig';
import { isKingInCheck, wouldMoveExposureKing } from '@/utils/chessEngine';

// Color type: 'w' for white, 'b' for black
export type Color = 'w' | 'b';

// Piece type: K=King, Q=Queen, R=Rook, B=Bishop, N=Knight, P=Pawn
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

interface Piece {
  type: PieceType;
  color: Color;
}

export interface ChessBoardProps extends BoardConfig {
  fen?: string;
  sideToMove?: Color;
  myColor?: Color;
  boardTheme?: BoardTheme;
  themeMode?: ThemeMode;
  onMove?: (from: string, to: string, promotion?: string) => void | Promise<void>;
}

interface Square {
  file: number;
  rank: number;
}

/**
 * Parse FEN string and return a board state
 * Returns an 8x8 array where board[rank][file] is a piece or null
 * Note: board[0] = rank 1 (white's first rank), board[7] = rank 8 (black's first rank)
 */
const parseFEN = (fen: string): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const fenParts = fen.split(' ');
  const fenBoard = fenParts[0];
  const ranks = fenBoard.split('/');

  ranks.forEach((rankStr, fenRankIdx) => {
    // Convert FEN rank index to board index
    // FEN rank 0 = rank 8 (board[7]), FEN rank 7 = rank 1 (board[0])
    const boardRankIdx = 7 - fenRankIdx;
    
    let fileIdx = 0;
    for (const char of rankStr) {
      if (/\d/.test(char)) {
        // Empty squares
        fileIdx += parseInt(char);
      } else {
        // Piece
        const color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toUpperCase() as PieceType;
        board[boardRankIdx][fileIdx] = { type, color };
        fileIdx++;
      }
    }
  });

  return board;
};

/**
 * Get piece emoji symbol
 */
const getPieceEmoji = (piece: Piece | null): string => {
  if (!piece) return '';

  const pieces: Record<PieceType, Record<Color, string>> = {
    K: { w: '♔', b: '♚' },
    Q: { w: '♕', b: '♛' },
    R: { w: '♖', b: '♜' },
    B: { w: '♗', b: '♝' },
    N: { w: '♘', b: '♞' },
    P: { w: '♙', b: '♟' },
  };

  return pieces[piece.type][piece.color];
};

export const ChessBoard = React.forwardRef<View, ChessBoardProps>(
  ({
    size = defaultBoardConfig.size,
    squareSize = defaultBoardConfig.squareSize,
    borderRadius = defaultBoardConfig.borderRadius,
    isInteractive = defaultBoardConfig.isInteractive,
    disabledOpacity = defaultBoardConfig.disabledOpacity,
    boardTheme = 'green',
    themeMode = 'light',
    sideToMove = 'w',
    myColor = 'w',
    fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    onMove,
  }, ref) => {
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const board = parseFEN(fen);
    
    // Get board colors from theme config
    const themeColors = getBoardColors(boardTheme, themeMode);

    const toAlgebraic = (file: number, rank: number): string => {
      return String.fromCharCode(97 + file) + (rank + 1);
    };

    const isLightSquare = (file: number, rank: number): boolean => {
      return (file + rank) % 2 === 0;
    };

    /**
     * Check if a move is valid for the selected piece
     */
    const isValidPawnMove = (
      fromFile: number,
      fromRank: number,
      toFile: number,
      toRank: number,
      piece: Piece | null
    ): boolean => {
      if (!piece || piece.type !== 'P') return false;

      const direction = piece.color === 'w' ? 1 : -1;
      const startRank = piece.color === 'w' ? 1 : 6;
      const isStartingPosition = fromRank === startRank;

      // Same file (forward move)
      if (fromFile === toFile) {
        // One square forward
        if (toRank === fromRank + direction) {
          return !board[toRank][toFile]; // Destination must be empty
        }
        // Two squares forward from starting position
        if (
          isStartingPosition &&
          toRank === fromRank + direction * 2 &&
          !board[fromRank + direction][fromFile] && // Intermediate square must be empty
          !board[toRank][toFile] // Destination must be empty
        ) {
          return true;
        }
      }

      // Diagonal capture
      if (Math.abs(fromFile - toFile) === 1 && toRank === fromRank + direction) {
        return !!board[toRank][toFile]; // Destination must have opponent piece
      }

      return false;
    };

    /**
     * Check if a square has a piece of our color
     */
    const hasOwnPiece = (file: number, rank: number): boolean => {
      const piece = board[rank][file];
      return !!piece && piece.color === myColor;
    };

    /**
     * Check if a move is valid for a knight
     */
    const isValidKnightMove = (
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
     * Check if a move is valid for a bishop (diagonal)
     */
    const isValidBishopMove = (
      fromFile: number,
      fromRank: number,
      toFile: number,
      toRank: number
    ): boolean => {
      const fileDiff = Math.abs(fromFile - toFile);
      const rankDiff = Math.abs(fromRank - toRank);
      if (fileDiff !== rankDiff || fileDiff === 0) return false;

      // Check if path is clear
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
     * Check if a move is valid for a rook (straight)
     */
    const isValidRookMove = (
      fromFile: number,
      fromRank: number,
      toFile: number,
      toRank: number
    ): boolean => {
      if (fromFile !== toFile && fromRank !== toRank) return false;

      // Check if path is clear
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
     * Check if a move is valid for a queen (combination of rook and bishop)
     */
    const isValidQueenMove = (
      fromFile: number,
      fromRank: number,
      toFile: number,
      toRank: number
    ): boolean => {
      return (
        isValidRookMove(fromFile, fromRank, toFile, toRank) ||
        isValidBishopMove(fromFile, fromRank, toFile, toRank)
      );
    };

    /**
     * Check if a move is valid for a king (one square in any direction)
     */
    const isValidKingMove = (
      fromFile: number,
      fromRank: number,
      toFile: number,
      toRank: number
    ): boolean => {
      return Math.abs(fromFile - toFile) <= 1 && Math.abs(fromRank - toRank) <= 1;
    };

    /**
     * Check if a move is valid based on piece type and check constraints
     */
    const isValidMove = (
      fromFile: number,
      fromRank: number,
      toFile: number,
      toRank: number,
      piece: Piece
    ): boolean => {
      if (fromFile === toFile && fromRank === toRank) return false;

      const targetSquare = board[toRank][toFile];
      if (targetSquare && targetSquare.color === piece.color) return false; // Can't capture own piece

      // Check basic move validity based on piece type
      let isMoveValid = false;
      
      switch (piece.type) {
        case 'P':
          isMoveValid = isValidPawnMove(fromFile, fromRank, toFile, toRank, piece);
          break;
        case 'N':
          isMoveValid = isValidKnightMove(fromFile, fromRank, toFile, toRank);
          break;
        case 'B':
          isMoveValid = isValidBishopMove(fromFile, fromRank, toFile, toRank);
          break;
        case 'R':
          isMoveValid = isValidRookMove(fromFile, fromRank, toFile, toRank);
          break;
        case 'Q':
          isMoveValid = isValidQueenMove(fromFile, fromRank, toFile, toRank);
          break;
        case 'K':
          isMoveValid = isValidKingMove(fromFile, fromRank, toFile, toRank);
          break;
        default:
          isMoveValid = false;
      }

      if (!isMoveValid) return false;

      // If king is in check, verify the move resolves it
      if (isKingInCheck(board, piece.color)) {
        console.log(`[CHESS] King is in check! Only moves that resolve check are allowed.`);
        if (wouldMoveExposureKing(board, fromFile, fromRank, toFile, toRank, piece.color)) {
          console.log(`[CHESS] ❌ Move does not resolve check!`);
          return false;
        }
      } else {
        // If not in check, verify move doesn't expose king
        if (wouldMoveExposureKing(board, fromFile, fromRank, toFile, toRank, piece.color)) {
          console.log(`[CHESS] ❌ Move would expose king to check!`);
          return false;
        }
      }

      return true;
    };

    const handleSquarePress = async (file: number, rank: number) => {
      const squareAlg = toAlgebraic(file, rank);
      console.log(`\n[CHESS] Square pressed: ${squareAlg} (file=${file}, rank=${rank})`);
      console.log(`[CHESS] Board state: sideToMove=${sideToMove}, myColor=${myColor}, isInteractive=${isInteractive}`);
      
      if (!isInteractive) {
        console.log('[CHESS] ❌ Board not interactive');
        return;
      }
      
      if (sideToMove !== myColor) {
        console.log(`[CHESS] ❌ Not your turn. sideToMove=${sideToMove}, myColor=${myColor}`);
        return;
      }

      if (!selectedSquare) {
        // Select a piece
        const piece = board[rank][file];
        console.log(`[CHESS] First click - checking piece at ${squareAlg}:`, piece);
        
        if (hasOwnPiece(file, rank)) {
          console.log(`[CHESS] ✅ Selected own piece: ${piece?.type} at ${squareAlg}`);
          setSelectedSquare({ file, rank });
        } else {
          console.log(`[CHESS] ❌ No own piece at ${squareAlg}`);
        }
      } else {
        // Try to move the selected piece
        const fromAlgebraic = toAlgebraic(selectedSquare.file, selectedSquare.rank);
        const toAlgebraicStr = toAlgebraic(file, rank);
        const fromPiece = board[selectedSquare.rank][selectedSquare.file];
        const toPiece = board[rank][file];

        console.log(`[CHESS] Move attempt: ${fromAlgebraic} → ${toAlgebraicStr}`);
        console.log(`[CHESS] From piece: ${fromPiece?.type} (color=${fromPiece?.color})`);
        console.log(`[CHESS] To piece: ${toPiece?.type || 'empty'} (color=${toPiece?.color || 'none'})`);

        // Check if destination is our own piece
        if (hasOwnPiece(file, rank)) {
          console.log(`[CHESS] ℹ️ Destination has own piece, switching selection`);
          setSelectedSquare({ file, rank });
          return;
        }

        // Validate move based on piece type
        if (!fromPiece) {
          console.log('[CHESS] ❌ No piece at source square');
          setSelectedSquare(null);
          return;
        }
        
        const isValid = isValidMove(selectedSquare.file, selectedSquare.rank, file, rank, fromPiece);
        console.log(`[CHESS] Move validation: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        
        if (!isValid) {
          console.log(`[CHESS] Invalid ${fromPiece.type} move from ${fromAlgebraic} to ${toAlgebraicStr}`);
          setSelectedSquare(null);
          return;
        }

        // Execute the move
        if (onMove) {
          try {
            console.log(`[CHESS] 🎮 Executing move: ${fromAlgebraic} → ${toAlgebraicStr}`);
            await onMove(fromAlgebraic, toAlgebraicStr);
            console.log(`[CHESS] ✅ Move executed successfully`);
            setSelectedSquare(null);
          } catch (err) {
            console.error('[CHESS] ❌ Move failed:', err);
            setSelectedSquare(null);
          }
        } else {
          console.log('[CHESS] ⚠️ No onMove callback provided');
        }
      }
    };

    const lightColor = themeColors.lightSquare;
    const darkColor = themeColors.darkSquare;
    const selectedColor = '#7FC97F';
    const checkColor = '#FF6B6B'; // Red for check
    const boardBg = themeColors.background;

    // Detect if current player is in check
    const isMyKingInCheck = isKingInCheck(board, myColor);
    
    console.log(`[CHESS] Check detection: myColor=${myColor}, isInCheck=${isMyKingInCheck}`);

    return (
      <View
        ref={ref}
        style={[
          styles.board,
          {
            width: size,
            height: size,
            borderRadius: borderRadius,
            backgroundColor: boardBg,
            opacity: !isInteractive || sideToMove !== myColor ? disabledOpacity : 1,
          },
        ]}
      >
        {Array.from({ length: 8 }).map((_, rankIdx) => {
          const rank = myColor === 'w' ? 7 - rankIdx : rankIdx;
          return (
            <View key={rank} style={styles.row}>
              {Array.from({ length: 8 }).map((_, fileIdx) => {
                const file = myColor === 'w' ? fileIdx : 7 - fileIdx;
                const isLight = isLightSquare(file, rank);
                const isSelected =
                  selectedSquare?.file === file &&
                  selectedSquare?.rank === rank;
                const piece = board[rank][file];
                
                // Check if this square contains the king in check
                const isKingInCheckOnSquare = isMyKingInCheck && piece?.type === 'K' && piece.color === myColor;

                return (
                  <Pressable
                    key={`${file}-${rank}`}
                    onPress={() => handleSquarePress(file, rank)}
                    style={[
                      styles.square,
                      {
                        width: squareSize,
                        height: squareSize,
                        backgroundColor: isKingInCheckOnSquare
                          ? checkColor
                          : isSelected
                          ? selectedColor
                          : isLight
                          ? lightColor
                          : darkColor,
                      },
                    ]}
                  >
                    <Text style={[styles.piece, { fontSize: squareSize * 0.6 }]}>
                      {getPieceEmoji(piece)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  }
);

ChessBoard.displayName = 'ChessBoard';

const styles = StyleSheet.create({
  board: {
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  square: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  piece: {
    textAlign: 'center',
  },
  squareLabel: {
    fontSize: 8,
    color: 'rgba(0, 0, 0, 0.3)',
    fontWeight: '600',
  },
});
