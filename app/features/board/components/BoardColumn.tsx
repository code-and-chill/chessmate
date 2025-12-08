import React from 'react';
import Animated from 'react-native-reanimated';
import { View, Text } from 'react-native';
import { PlayerCard, GameActions } from '@/features/game';
import { ChessBoard } from '@/features/board/components/ChessBoard';
import { VStack } from '@/ui/primitives/Stack';
import { spacingTokens } from '@/ui/tokens/spacing';
import { useBoardLayout } from '@/features/board/hooks/useBoardLayout';

export interface BoardColumnProps {
  boardSize: number;
  squareSize: number;
  boardProps: any;
  gameState: any;
  timerState: any;
  onTimeExpire: (color: 'w' | 'b') => void;
  onResign: () => void;
  onOfferDraw: () => void;
  drawOfferPending?: boolean;
  anim: (delay: number) => any;
  isCompact?: boolean;
  flex?: number;
  colors?: any;
}

export function BoardColumn({
  boardSize,
  squareSize,
  boardProps,
  gameState,
  timerState,
  onTimeExpire,
  onResign,
  onOfferDraw,
  drawOfferPending,
  anim,
  isCompact,
  flex = 1,
  colors,
}: BoardColumnProps) {
  const layout = useBoardLayout();
  const boardSizeFinal = boardSize ?? layout.boardSize;
  const squareSizeFinal = squareSize ?? layout.squareSize;
  const compactFinal = typeof isCompact !== 'undefined' ? isCompact : !layout.isHorizontalLayout;

  return (
    <VStack flex={flex} gap={spacingTokens[1]} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View entering={anim(0)} style={{ width: boardSizeFinal }}>
        <PlayerCard
          color="b"
          name="Opponent"
          rating={1500}
          isSelf={false}
          isActive={gameState.sideToMove === 'b'}
          remainingMs={timerState.blackTimeMs}
          capturedPieces={gameState.capturedByWhite}
          onTimeExpire={() => onTimeExpire('b')}
        />
      </Animated.View>

      <Animated.View entering={anim(50)} style={{ width: boardSizeFinal, height: boardSizeFinal }}>
        <ChessBoard key={`${gameState.fen}-${gameState.sideToMove}`} {...boardProps} size={boardSizeFinal} squareSize={squareSizeFinal} />
      </Animated.View>

      <Animated.View entering={anim(150)} style={{ width: boardSizeFinal }}>
        <PlayerCard
          color="w"
          name="Player"
          rating={1450}
          isSelf={true}
          isActive={gameState.sideToMove === 'w'}
          remainingMs={timerState.whiteTimeMs}
          capturedPieces={gameState.capturedByBlack}
          onTimeExpire={() => onTimeExpire('w')}
        />
      </Animated.View>

      {!compactFinal && (
        <Animated.View entering={anim(200)} style={{ width: boardSizeFinal }}>
          <GameActions
            status={gameState.status}
            result={gameState.result}
            endReason={gameState.endReason}
            sideToMove={gameState.sideToMove}
            onResign={onResign}
            onOfferDraw={onOfferDraw}
          />

          {drawOfferPending && colors && (
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <Text style={{ color: colors.text.primary, fontSize: 13 }}>Draw offer sent — awaiting response…</Text>
            </View>
          )}
        </Animated.View>
      )}
    </VStack>
  );
}
