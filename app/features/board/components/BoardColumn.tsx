import React, { useMemo } from 'react';
import Animated, { Layout } from 'react-native-reanimated';
import { View, Text, StyleSheet } from 'react-native';
import { PlayerCard, GameActions } from '@/features/game';
import { ChessBoard } from '@/features/board/components/ChessBoard';
import { VStack, HStack } from '@/ui/primitives/Stack';
import { spacingTokens } from '@/ui/tokens/spacing';
import { useBoardLayout } from '@/features/board/hooks/useBoardLayout';
import { EvalBar } from '@/ui/components/chess/EvalBar';

export interface BoardProps {
  // minimal shape used by this component — expand as needed
  orientation?: 'white' | 'black';
  myColor?: 'w' | 'b' | string;
  // any other props are forwarded to ChessBoard
  [key: string]: any;
}

export interface GameState {
  fen: string;
  sideToMove: 'w' | 'b' | string;
  status?: string;
  result?: string;
  endReason?: string;
  isLocal?: boolean;
  capturedByWhite?: any[];
  capturedByBlack?: any[];
}

export interface TimerState {
  whiteTimeMs?: number;
  blackTimeMs?: number;
}

export interface BoardColumnProps {
  boardSize?: number;
  squareSize?: number;
  boardProps: BoardProps;
  gameState: GameState;
  timerState: TimerState;
  onTimeExpire: (color: 'w' | 'b') => void;
  onResign: () => void;
  onOfferDraw: () => void;
  drawOfferPending?: boolean;
  anim: (delay: number) => any;
  isCompact?: boolean;
  flex?: number;
  colors?: { text?: { primary?: string } } | null;
  evaluation?: number | null;
  showEvaluation?: boolean;
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
  evaluation = null,
  showEvaluation = true,
}: BoardColumnProps) {
  const layout = useBoardLayout();

  const boardSizeFinal = useMemo(() => boardSize ?? layout.boardSize, [boardSize, layout.boardSize]);
  const squareSizeFinal = useMemo(() => squareSize ?? layout.squareSize, [squareSize, layout.squareSize]);
  const compactFinal = useMemo(() => (typeof isCompact !== 'undefined' ? isCompact : !layout.isHorizontalLayout), [isCompact, layout.isHorizontalLayout]);
  const evalBarWidth = 32;
  const hasEvalBar = showEvaluation && evaluation !== null;
  const totalSectionWidth = useMemo(() => {
    if (hasEvalBar) {
      return evalBarWidth + spacingTokens[2] + boardSizeFinal;
    }
    return boardSizeFinal;
  }, [hasEvalBar, boardSizeFinal]);

  return (
    <VStack flex={flex} gap={spacingTokens[1]} style={styles.container}>
      <Animated.View entering={anim(0)} layout={Layout.springify()} style={{ width: totalSectionWidth }}>
        <PlayerCard
          color="b"
          name="Opponent"
          rating={1500}
          isSelf={false}
          isActive={gameState.sideToMove === 'b'}
          remainingMs={timerState.blackTimeMs ?? 0}
          capturedPieces={gameState.capturedByWhite}
          onTimeExpire={() => onTimeExpire('b')}
        />
      </Animated.View>

      <Animated.View entering={anim(50)} layout={Layout.springify()} style={{ width: totalSectionWidth }}>
        <HStack gap={spacingTokens[2]} alignItems="center" justifyContent="center">
          {showEvaluation && evaluation !== null && (
            <EvalBar
              evaluation={evaluation}
              playerColor={boardProps.myColor === 'w' ? 'white' : 'black'}
              orientation="vertical"
              width={32}
              height={boardSizeFinal}
              showValue={true}
              animated={true}
            />
          )}
          <ChessBoard key={`${gameState.fen}-${gameState.sideToMove}`} {...(boardProps as any)} size={boardSizeFinal} squareSize={squareSizeFinal} />
        </HStack>
      </Animated.View>

      <Animated.View entering={anim(150)} layout={Layout.springify()} style={{ width: totalSectionWidth }}>
        <PlayerCard
          color="w"
          name="Player"
          rating={1450}
          isSelf={true}
          isActive={gameState.sideToMove === 'w'}
          remainingMs={timerState.whiteTimeMs ?? 0}
          capturedPieces={gameState.capturedByBlack}
          onTimeExpire={() => onTimeExpire('w')}
        />
      </Animated.View>

      {!compactFinal && (
        <Animated.View entering={anim(200)} layout={Layout.springify()} style={{ width: totalSectionWidth }}>
          <GameActions
            status={gameState.status as any}
            result={gameState.result as any}
            endReason={gameState.endReason}
            sideToMove={gameState.sideToMove as any}
            onResign={onResign}
            onOfferDraw={onOfferDraw}
          />

          {drawOfferPending && colors && (
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <Text style={{ color: colors.text?.primary ?? '#000', fontSize: 13 }}>Draw offer sent — awaiting response…</Text>
            </View>
          )}
        </Animated.View>
      )}
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0, // Allow flex children to shrink below their content size
  },
});
