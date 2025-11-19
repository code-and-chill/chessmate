import { useState, useCallback } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  GameActions, 
  GameHeaderCard,
  GameResultModal, 
  PawnPromotionModal,
  PlayerCard,
  type PieceType 
} from '@/features/game';
import { createPlayScreenConfig, getHydratedBoardProps } from '@/features/board/config';
import { GameBoardSection } from '@/features/board/components/GameBoardSection';
import { GameBoardContainer } from '@/features/board/components/PlayersSection';
import { useGameState, usePromotionModal, useGameTimer } from '@/features/board/hooks';
import { useReducedMotion } from '@/features/board/hooks/useReducedMotion';
import { useResponsiveLayout } from '@/features/board/hooks/useResponsiveLayout';
import { Box } from '@/ui/primitives/Box';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui/primitives/Stack';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';

export interface PlayScreenProps {
  gameId?: string;
}

export function PlayScreen(_props: PlayScreenProps = {}): React.ReactElement {
  const { colors } = useThemeTokens();
  const screenConfig = createPlayScreenConfig();
  
  // Custom hooks for separation of concerns
  const [gameState, { makeMove, endGame }] = useGameState();
  const [promotionState, promotionActions] = usePromotionModal();
  const [timerState, { handleTimeExpire }] = useGameTimer(endGame);
  
  // UI state
  const [showResultModal, setShowResultModal] = useState(false);
  const reduceMotion = useReducedMotion();
  const { isWideLayout, boardSize, squareSize } = useResponsiveLayout();

  // Derived state
  const boardConfig = {
    ...getHydratedBoardProps(screenConfig),
    size: boardSize,
    squareSize,
  };

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
    <Box flex={1} style={{ backgroundColor: colors.background.primary }}>
      <VStack flex={1} gap={0}>
        {/* Game Header */}
        <Box style={{ padding: spacingTokens[4], paddingBottom: spacingTokens[2] }}>
          <GameHeaderCard
            status={gameState.status === 'in_progress' ? 'live' : 'ended'}
            gameMode="Blitz"
            timeControl="10+0"
            isRated={true}
          />
        </Box>

        {/* Opponent Player Card */}
        <Box style={{ paddingHorizontal: spacingTokens[4], paddingBottom: spacingTokens[2] }}>
          <Animated.View entering={createAnimConfig(0)}>
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
        </Box>

        {/* Board and Move List Container */}
        <GameBoardContainer>
          <GameBoardSection
            boardConfig={boardConfig}
            fen={gameState.fen}
            sideToMove={gameState.sideToMove}
            lastMove={gameState.lastMove}
            isInteractive={gameState.status === 'in_progress'}
            onMove={handleMove}
            moves={gameState.moves}
            isWideLayout={isWideLayout}
            boardSize={boardSize}
            reduceMotion={reduceMotion}
          />
        </GameBoardContainer>

        {/* Player Card */}
        <Box style={{ paddingHorizontal: spacingTokens[4], paddingTop: spacingTokens[2], paddingBottom: spacingTokens[2] }}>
          <Animated.View entering={createAnimConfig(150)}>
            <PlayerCard
              color="w"
              name="You"
              rating={1450}
              isSelf={true}
              isActive={gameState.sideToMove === 'w'}
              remainingMs={timerState.whiteTimeMs}
              capturedPieces={gameState.capturedByBlack}
              onTimeExpire={() => handleTimeExpire('w')}
            />
          </Animated.View>
        </Box>

        {/* Game Actions */}
        <Box style={{ paddingHorizontal: spacingTokens[4], paddingBottom: spacingTokens[4] }}>
          <Animated.View entering={createAnimConfig(200)}>
            <Card variant="default" size="md" padding={8}>
              <GameActions
                status={gameState.status}
                result={gameState.result}
                endReason={gameState.endReason}
                sideToMove={gameState.sideToMove}
                onResign={handleResign}
                onOfferDraw={handleOfferDraw}
              />
            </Card>
          </Animated.View>
        </Box>
      </VStack>

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
    </Box>
  );
}
