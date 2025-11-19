import { useState, useCallback } from 'react';
import { Dimensions } from 'react-native';
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
  
  // Calculate board size (screen width - padding, max 420px)
  const BOARD_SIZE = Math.min(Dimensions.get('window').width - 48, 420);

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
    <Box flex={1} style={{ backgroundColor: colors.background.primary, padding: spacingTokens[4] }}>
      <VStack flex={1} gap={spacingTokens[4]}>
        {/* Game Header */}
        <GameHeaderCard
          status={gameState.status === 'in_progress' ? 'live' : 'ended'}
          gameMode="Blitz"
          timeControl="10+0"
          isRated={true}
        />

        {/* Main Game Area: Left Column (Players + Board + Actions) + Right Column (Move List) */}
        <Box style={{ flexDirection: 'row', flex: 1, gap: spacingTokens[4] }}>
          {/* Left Column - 50% */}
          <VStack flex={1} gap={spacingTokens[4]}>
            {/* Top Player Card (Opponent) */}
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

            {/* Chess Board */}
            <Animated.View entering={createAnimConfig(50)} style={{ alignItems: 'center' }}>
              <Card variant="elevated" size="md" padding={0}>
                <ChessBoard
                  {...boardProps}
                  size={BOARD_SIZE}
                  squareSize={BOARD_SIZE / 8}
                />
              </Card>
            </Animated.View>

            {/* Bottom Player Card (You) */}
            <Animated.View entering={createAnimConfig(150)}>
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

            {/* Game Actions */}
            <Animated.View entering={createAnimConfig(200)}>
              <GameActions
                status={gameState.status}
                result={gameState.result}
                endReason={gameState.endReason}
                sideToMove={gameState.sideToMove}
                onResign={handleResign}
                onOfferDraw={handleOfferDraw}
              />
            </Animated.View>
          </VStack>

          {/* Right Column - 50% - Full Height Move List */}
          <Animated.View entering={createAnimConfig(100)} style={{ flex: 1 }}>
            <Card variant="default" size="md" padding={0} style={{ flex: 1 }}>
              <MoveList moves={gameState.moves} />
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
