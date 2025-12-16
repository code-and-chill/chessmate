import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Square } from './Square';
import type { Piece as EnginePiece } from '@/core/utils/chess';
import type { PieceTheme } from '../types/pieces';

type BoardGridProps = {
  board: (EnginePiece | null)[][];
  orientation: 'white' | 'black';
  squareSize: number;
  getSquareBackground: (file: number, rank: number) => string;
  selectedSquare: { file: number; rank: number } | null;
  legalMoves: { file: number; rank: number }[];
  animatingPieceId?: string | null;
  animatingPiece?: any | null;
  isMyKingInCheck: boolean;
  onSquarePress: (file: number, rank: number) => void;
  pieceTheme?: PieceTheme;
  checkColor: string;
  translucentDark: string;
};

// Pre-computed rank/file arrays to avoid Array.from() on each render
const RANKS = [0, 1, 2, 3, 4, 5, 6, 7];
const FILES = [0, 1, 2, 3, 4, 5, 6, 7];

/**
 * Optimized chess board grid component.
 * Uses memoization and Set-based lookup for O(1) legal move checks.
 */
export const BoardGrid = React.memo<BoardGridProps>(({
  board,
  orientation,
  squareSize,
  getSquareBackground,
  selectedSquare,
  legalMoves,
  animatingPiece,
  isMyKingInCheck,
  onSquarePress,
  pieceTheme,
  checkColor,
  translucentDark,
}) => {
  // Convert legal moves array to Set for O(1) lookup instead of O(n) .some()
  const legalMovesSet = useMemo(() => {
    const set = new Set<string>();
    for (const move of legalMoves) {
      set.add(`${move.file}-${move.rank}`);
    }
    return set;
  }, [legalMoves]);

  // Memoize the check for legal moves
  const isLegalMove = useCallback(
    (file: number, rank: number) => legalMovesSet.has(`${file}-${rank}`),
    [legalMovesSet]
  );

  // Memoize board dimensions
  const boardDimensions = useMemo(
    () => ({ width: squareSize * 8, height: squareSize * 8 }),
    [squareSize]
  );

  return (
    <View style={boardDimensions}>
      {RANKS.map((rankIdx) => {
        const rank = orientation === 'white' ? 7 - rankIdx : rankIdx;
        return (
          <View key={rank} style={styles.row}>
            {FILES.map((fileIdx) => {
              const file = orientation === 'white' ? fileIdx : 7 - fileIdx;
              const isSelected = selectedSquare?.file === file && selectedSquare?.rank === rank;
              const piece = board[rank][file];
              const isAnimatingFrom = animatingPiece?.fromFile === file && animatingPiece?.fromRank === rank;
              const isKingInCheckOnSquare = isMyKingInCheck && piece?.type === 'K' && piece?.color === (animatingPiece ? animatingPiece.piece.color : piece?.color);

              return (
                <Square
                  key={`${file}-${rank}`}
                  file={file}
                  rank={rank}
                  orientation={orientation}
                  squareSize={squareSize}
                  backgroundColor={getSquareBackground(file, rank)}
                  isSelected={isSelected}
                  isLegalMove={isLegalMove(file, rank)}
                  piece={piece}
                  isAnimatingFrom={isAnimatingFrom}
                  isKingInCheckOnSquare={isKingInCheckOnSquare}
                  onPress={onSquarePress}
                  pieceTheme={pieceTheme}
                  checkColor={checkColor}
                  translucentDark={translucentDark}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
});

BoardGrid.displayName = 'BoardGrid';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});

export default BoardGrid;
