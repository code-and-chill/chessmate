import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../ui/theme/ThemeContext';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { boardTokens } from '../../ui/tokens';

// Color type: 'w' for white, 'b' for black
export type Color = 'w' | 'b';

export interface ChessBoardProps {
  fen: string;
  sideToMove?: Color;
  myColor?: Color;
  isInteractive: boolean;
  onMove?(from: string, to: string, promotion?: string): void | Promise<void>;
}

interface Square {
  file: number;
  rank: number;
}

export const ChessBoard = React.forwardRef<any, ChessBoardProps>(
  ({ fen, sideToMove = 'w', myColor = 'w', isInteractive, onMove }, ref) => {
    const { colors } = useTheme();
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

    const squareSize = boardTokens.squareSize;

    const toAlgebraic = (file: number, rank: number): string => {
      return String.fromCharCode(97 + file) + (rank + 1);
    };

    const isLightSquare = (file: number, rank: number): boolean => {
      return (file + rank) % 2 === 0;
    };

    const handleSquarePress = async (file: number, rank: number) => {
      if (!isInteractive || !onMove || sideToMove !== myColor) {
        return;
      }

      const algebraic = toAlgebraic(file, rank);

      if (!selectedSquare) {
        setSelectedSquare({ file, rank });
      } else {
        const fromAlgebraic = toAlgebraic(selectedSquare.file, selectedSquare.rank);
        
        try {
          await onMove(fromAlgebraic, algebraic);
          setSelectedSquare(null);
        } catch (err) {
          console.error('Move failed:', err);
        }
      }
    };

    return (
      <Box
        ref={ref}
        style={{
          width: boardTokens.size,
          height: boardTokens.size,
          borderRadius: boardTokens.borderRadius,
          overflow: 'hidden',
          backgroundColor: colors.appBackground,
        }}
      >
        {Array.from({ length: 8 }).map((_, rankIdx) => {
          const rank = myColor === 'w' ? 7 - rankIdx : rankIdx;
          return (
            <Box key={rank} flexDirection="row">
              {Array.from({ length: 8 }).map((_, fileIdx) => {
                const file = myColor === 'w' ? fileIdx : 7 - fileIdx;
                const isLight = isLightSquare(file, rank);
                const isSelected =
                  selectedSquare?.file === file && selectedSquare?.rank === rank;

                return (
                  <Pressable
                    key={`${file}-${rank}`}
                    onPress={() => handleSquarePress(file, rank)}
                    style={{
                      width: squareSize,
                      height: squareSize,
                      backgroundColor: isSelected
                        ? colors.accentGreenDark
                        : isLight
                        ? colors.boardLight
                        : colors.boardDark,
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: !isInteractive || sideToMove !== myColor ? 0.7 : 1,
                    }}
                  >
                    <Text variant="caption" color="muted">
                      {toAlgebraic(file, rank)}
                    </Text>
                  </Pressable>
                );
              })}
            </Box>
          );
        })}
      </Box>
    );
  }
);

ChessBoard.displayName = 'ChessBoard';
