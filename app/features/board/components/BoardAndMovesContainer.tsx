/**
 * BoardAndMovesContainer Component
 * app/features/board/components/BoardAndMovesContainer.tsx
 * 
 * Container that displays board and move list side-by-side
 * - Board is fixed square size (BOARD_SIZE)
 * - Move list matches board height
 * - Both in single horizontal container
 */

import * as React from 'react';
import { View, Dimensions } from 'react-native';
import { ChessBoard, type ChessBoardProps } from '@/features/board/components/ChessBoard';
import { MoveList, type Move } from '@/features/game';
import { Card } from '@/ui/primitives/Card';
import { spacingTokens } from '@/ui/tokens/spacing';

export interface BoardAndMovesContainerProps {
  // Board props
  boardProps: Omit<ChessBoardProps, 'size' | 'squareSize'>;
  
  // Move list props
  moves: Move[];
  onMoveSelect?: (moveIndex: number) => void;
  
  // Optional custom board size (default: screen width - padding, max 420px)
  boardSize?: number;
}

export const BoardAndMovesContainer: React.FC<BoardAndMovesContainerProps> = React.memo(({
  boardProps,
  moves,
  onMoveSelect,
  boardSize: customBoardSize,
}) => {
  const BOARD_SIZE = customBoardSize || Math.min(Dimensions.get('window').width - 48, 420);
  const SQUARE_SIZE = BOARD_SIZE / 8;

  return (
    <View
      style={{
        height: BOARD_SIZE,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: spacingTokens[4],
        gap: spacingTokens[3],
      }}
    >
      {/* Board View - Fixed Square */}
      <Card variant="elevated" size="md" padding={0}>
        <ChessBoard
          {...boardProps}
          size={BOARD_SIZE}
          squareSize={SQUARE_SIZE}
        />
      </Card>

      {/* Move List - Matches Board Height */}
      <Card
        variant="default"
        size="md"
        padding={0}
        style={{
          width: 140,
          height: BOARD_SIZE,
        }}
      >
        <MoveList
          moves={moves}
          onMoveSelect={onMoveSelect}
        />
      </Card>
    </View>
  );
});

BoardAndMovesContainer.displayName = 'BoardAndMovesContainer';
