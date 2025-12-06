import { useState, useCallback } from 'react';
import { Pressable, Text, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  GameActions, 
  GameHeaderCard,
  GameResultModal, 
  PawnPromotionModal,
  PlayerCard,
  MoveList,
  type PieceType 
} from '@/features/game';
import { createPlayScreenConfig, getHydratedBoardProps } from '@/features/board/config';
import { ChessBoard } from '@/features/board/components/ChessBoard';
import { useGameState, usePromotionModal, useGameTimer } from '@/features/board/hooks';
import { useReducedMotion } from '@/features/board/hooks/useReducedMotion';
import { Box } from '@/ui/primitives/Box';
import { VStack } from '@/ui/primitives/Stack';
import { Card } from '@/ui/primitives/Card';
import { Panel } from '@/ui/primitives/Panel';
import { Surface } from '@/ui/primitives/Surface';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';
import { getLayoutType, calculateBoardSize, type LayoutType } from '@/ui/layouts/ResponsiveGameLayout';

export interface PlayScreenProps {
  gameId?: string;
}

export function PlayScreen(_props: PlayScreenProps = {}): React.ReactElement {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const screenConfig = createPlayScreenConfig();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  // Custom hooks for separation of concerns
  const [gameState, { makeMove, endGame }] = useGameState();
  const [promotionState, promotionActions] = usePromotionModal();
  const [timerState, { handleTimeExpire }] = useGameTimer(endGame);
  
  // UI state
  const [showResultModal, setShowResultModal] = useState(false);
  const reduceMotion = useReducedMotion();
  
  // Track measured content dimensions for accurate sizing (handles sidebar, collapsed states, etc.)
  const [contentDimensions, setContentDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Handle layout measurement to get actual content area dimensions
  const handleContentLayout = (event: LayoutChangeEvent) => {
    const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout;
    // Only update if dimensions changed significantly (avoid unnecessary re-renders)
    if (
      !contentDimensions ||
      Math.abs(measuredWidth - contentDimensions.width) > 1 ||
      Math.abs(measuredHeight - contentDimensions.height) > 1
    ) {
      setContentDimensions({ width: measuredWidth, height: measuredHeight });
    }
  };
  
  // Use measured content dimensions, fall back to window dimensions on first render
  const effectiveWidth = contentDimensions?.width ?? windowWidth;
  const effectiveHeight = contentDimensions?.height ?? windowHeight;
  
  // Use standardized responsive layout utilities based on actual content width
  const layoutType = getLayoutType(effectiveWidth);
  const isHorizontalLayout = layoutType !== 'mobile';
  const isDesktopLayout = layoutType === 'desktop';
  
  // Calculate board size using measured content dimensions
  const { boardSize: BOARD_SIZE, squareSize: SQUARE_SIZE } = calculateBoardSize(
    layoutType,
    effectiveWidth,
    effectiveHeight
  );

  /**
   * Handle move from the chess board
   * Checks for pawn promotion before making the move
   */
  const handleMove = useCallback(
    (from: string, to: string) => {
      const needsPromotion = promotionActions.checkPromotion(
        from,
        to,
        gameState.fen,
        gameState.sideToMove
      );

      if (needsPromotion) {
        promotionActions.showPromotion(from, to);
        return;
      }

      makeMove(from, to);
      
      // Show result modal if game ended
      if (gameState.status === 'ended') {
        setShowResultModal(true);
      }
    },
    [gameState.fen, gameState.sideToMove, gameState.status, makeMove, promotionActions]
  );

  // Board props for BoardAndMovesContainer
  const boardProps = {
    ...getHydratedBoardProps(screenConfig),
    fen: gameState.fen,
    sideToMove: gameState.sideToMove,
    myColor: gameState.sideToMove,
    orientation: (gameState.sideToMove === 'w' ? 'white' : 'black') as 'white' | 'black',
    lastMove: gameState.lastMove,
    isInteractive: gameState.status === 'in_progress',
    onMove: handleMove,
  };

  /**
   * Handle pawn promotion selection
   */
  const handlePawnPromotion = useCallback(
    (piece: PieceType) => {
      if (!promotionState.move) return;

      const { from, to } = promotionState.move;
      makeMove(from, to, piece);
      promotionActions.hidePromotion();

      if (gameState.status === 'ended') {
        setShowResultModal(true);
      }
    },
    [promotionState.move, makeMove, promotionActions, gameState.status]
  );

  /**
   * Handle player resignation
   */
  const handleResign = useCallback(() => {
    const winner = gameState.sideToMove === 'w' ? '0-1' : '1-0';
    const resigningPlayer = gameState.sideToMove === 'w' ? 'White' : 'Black';
    endGame(winner, `${resigningPlayer} resigned`);
    setShowResultModal(true);
  }, [gameState.sideToMove, endGame]);

  /**
   * Handle draw offer
   */
  const handleOfferDraw = useCallback(() => {
    console.log('Draw offered - TODO: implement draw offer logic');
  }, []);

  /**
   * Create animation configuration based on accessibility
   */
  const createAnimConfig = useCallback(
    (delay: number) => (reduceMotion ? undefined : FadeInUp.duration(250).delay(delay)),
    [reduceMotion]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <View style={styles.container}>
        {/* Floating Gear Icon - Theme Settings */}
        <Pressable
          style={[styles.gearButton, { backgroundColor: colors.accent.primary }]}
          onPress={() => router.push('/settings/board-theme')}
        >
          <Text style={styles.gearIcon}>⚙️</Text>
        </Pressable>

        <Surface variant="subtle" style={{ flex: 1 }}>
          <Box 
            flex={1} 
            style={{ paddingHorizontal: spacingTokens[1], paddingTop: spacingTokens[2] }}
            onLayout={handleContentLayout}
          >
            <VStack flex={1} gap={spacingTokens[2]}>
              {/* Game Header */}
              <GameHeaderCard
                status={gameState.status === 'in_progress' ? 'live' : 'ended'}
                gameMode="Blitz"
                timeControl="10+0"
                isRated={true}
              />

              {/* Main Game Area - Responsive Layout (chess.com style - board fills screen) */}
              <Box style={{ 
                flexDirection: isHorizontalLayout ? 'row' : 'column', 
                flex: 1, 
                gap: spacingTokens[2],
                alignItems: 'stretch',
              }}>
                {/* Board Column (70% on desktop, 65% on tablet - chess.com style) */}
                <VStack 
                  flex={isHorizontalLayout ? (isDesktopLayout ? 0.70 : 0.65) : 1} 
                  gap={spacingTokens[1]}
                  style={{ 
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* Top Player Card (Opponent) */}
                  <Animated.View entering={createAnimConfig(0)} style={{ width: BOARD_SIZE }}>
                    <PlayerCard
                      color="b"
                      name="Opponent"
                      rating={1500}
                      isSelf={false}
                      isActive={gameState.sideToMove === 'b'}
                      remainingMs={timerState.blackTimeMs}
                      capturedPieces={gameState.capturedByWhite}
                      onTimeExpire={() => handleTimeExpire('b')}
                    />
                  </Animated.View>

                  {/* Chess Board */}
                  <Animated.View entering={createAnimConfig(50)} style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
                    <ChessBoard
                      {...boardProps}
                      size={BOARD_SIZE}
                      squareSize={SQUARE_SIZE}
                    />
                  </Animated.View>

                  {/* Bottom Player Card (You) */}
                  <Animated.View entering={createAnimConfig(150)} style={{ width: BOARD_SIZE }}>
                    <PlayerCard
                      color="w"
                      name="Player"
                      rating={1450}
                      isSelf={true}
                      isActive={gameState.sideToMove === 'w'}
                      remainingMs={timerState.whiteTimeMs}
                      capturedPieces={gameState.capturedByBlack}
                      onTimeExpire={() => handleTimeExpire('w')}
                    />
                  </Animated.View>

                  {/* Game Actions (mobile only - shown below board) */}
                  {!isHorizontalLayout && (
                    <Animated.View entering={createAnimConfig(200)} style={{ width: BOARD_SIZE }}>
                      <GameActions
                        status={gameState.status}
                        result={gameState.result}
                        endReason={gameState.endReason}
                        sideToMove={gameState.sideToMove}
                        onResign={handleResign}
                        onOfferDraw={handleOfferDraw}
                      />
                    </Animated.View>
                  )}
                </VStack>

                {/* Move List - Glassmorphic Panel on desktop (30%), Card on tablet (35%) - chess.com style */}
                <Animated.View 
                  entering={createAnimConfig(100)} 
                  style={{ 
                    flex: isHorizontalLayout ? (isDesktopLayout ? 0.30 : 0.35) : 0,
                    minHeight: isHorizontalLayout ? 0 : 200,
                    maxHeight: isHorizontalLayout ? undefined : 300,
                    alignSelf: 'stretch',
                  }}
                >
                  {isDesktopLayout ? (
                    <Panel variant="glass" padding={0} style={{ flex: 1, overflow: 'hidden' }}>
                      <MoveList moves={gameState.moves} />
                    </Panel>
                  ) : (
                    <Card variant="default" size="md" padding={0} style={{ flex: 1 }}>
                      <MoveList moves={gameState.moves} />
                    </Card>
                  )}
                </Animated.View>
              </Box>
            </VStack>
          </Box>
        </Surface>

        {/* Modals */}
        <PawnPromotionModal
          visible={promotionState.isVisible}
          color={gameState.sideToMove}
          onSelect={handlePawnPromotion}
          onCancel={promotionActions.hidePromotion}
        />

        {gameState.result && (
          <GameResultModal
            visible={showResultModal}
            result={gameState.result}
            reason={gameState.endReason}
            isPlayerWhite={true}
            onClose={() => setShowResultModal(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  gearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  gearIcon: {
    fontSize: 28,
  },
});
