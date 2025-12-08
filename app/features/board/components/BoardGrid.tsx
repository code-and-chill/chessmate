import React from 'react';
import { View } from 'react-native';
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

export const BoardGrid: React.FC<BoardGridProps> = ({
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
  return (
    <View style={{ width: squareSize * 8, height: squareSize * 8 }}>
      {Array.from({ length: 8 }).map((_, rankIdx) => {
        const rank = orientation === 'white' ? 7 - rankIdx : rankIdx;
        return (
          <View key={rank} style={{ flexDirection: 'row' }}>
            {Array.from({ length: 8 }).map((_, fileIdx) => {
              const file = orientation === 'white' ? fileIdx : 7 - fileIdx;
              const isSelected = selectedSquare?.file === file && selectedSquare?.rank === rank;
              const isLegalMove = legalMoves.some(m => m.file === file && m.rank === rank);
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
                  isLegalMove={isLegalMove}
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
};

export default BoardGrid;
