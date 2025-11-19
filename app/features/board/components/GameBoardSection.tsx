import type React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChessBoard } from '@/features/board';
import { MoveList, type Move } from '@/features/game';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack } from '@/ui/primitives/Stack';
import { spacingTokens } from '@/ui/tokens/spacing';
import type { BoardConfig } from '@/features/board/config';

interface GameBoardSectionProps {
  // Board props
  boardConfig: BoardConfig;
  fen: string;
  sideToMove: 'w' | 'b';
  lastMove: { from: string; to: string } | null;
  isInteractive: boolean;
  onMove: (from: string, to: string) => void;
  
  // Moves props
  moves: Move[];
  
  // Layout
  isWideLayout: boolean;
  boardSize: number;
  
  // Animation
  reduceMotion: boolean;
}

const createAnimConfig = (delay: number, reduceMotion: boolean) =>
  reduceMotion ? undefined : FadeInUp.duration(250).delay(delay);

export function GameBoardSection({
  boardConfig,
  fen,
  sideToMove,
  lastMove,
  isInteractive,
  onMove,
  moves,
  isWideLayout,
  boardSize,
  reduceMotion,
}: GameBoardSectionProps): React.ReactElement {
  const boardElement = (
    <Animated.View entering={createAnimConfig(50, reduceMotion)} style={{ flexShrink: 0 }}>
      <Card variant="elevated" size="md" padding={0}>
        <ChessBoard
          {...boardConfig}
          fen={fen}
          sideToMove={sideToMove}
          myColor={sideToMove}
          orientation={sideToMove === 'w' ? 'white' : 'black'}
          onMove={onMove}
          isInteractive={isInteractive}
          lastMove={lastMove}
        />
      </Card>
    </Animated.View>
  );

  const moveListElement = (
    <Animated.View
      entering={createAnimConfig(100, reduceMotion)}
      style={isWideLayout ? { flex: 1 } : { flex: 1, minHeight: 200 }}
    >
      <Card
        variant="default"
        size="md"
        padding={0}
        style={isWideLayout ? { flex: 1, minHeight: boardSize } : { flex: 1, minHeight: 200 }}
      >
        <MoveList moves={moves} />
      </Card>
    </Animated.View>
  );

  if (isWideLayout) {
    return (
      <HStack gap={spacingTokens[4]} alignItems="flex-start" style={{ flex: 1 }}>
        {boardElement}
        {moveListElement}
      </HStack>
    );
  }

  return (
    <VStack gap={spacingTokens[4]}>
      {boardElement}
      {moveListElement}
    </VStack>
  );
}
