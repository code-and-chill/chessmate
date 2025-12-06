import { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, useWindowDimensions, SafeAreaView, Modal, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClients } from '@/contexts/ApiContext';
import { useThemeTokens } from '@/ui';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  GameResultModal, 
  PawnPromotionModal,
  PlayerCard,
  MoveList,
  type PieceType,
  type Move
} from '@/features/game';
import { createPlayScreenConfig, getHydratedBoardProps } from '@/features/board/config';
import { ChessBoard } from '@/features/board/components/ChessBoard';
import { Box } from '@/ui/primitives/Box';
import { VStack, HStack } from '@/ui/primitives/Stack';
import { Card } from '@/ui/primitives/Card';
import { Panel } from '@/ui/primitives/Panel';
import { Surface } from '@/ui/primitives/Surface';
import { Button } from '@/ui/primitives/Button';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { applyMoveToFENSimple } from '@/core/utils/chess/engine';
import { getLayoutType, calculateBoardSize, type LayoutType } from '@/ui/layouts/ResponsiveGameLayout';

type PieceColor = 'w' | 'b';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { playApi } = useApiClients();
  
  const [gameState, setGameState] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [promotionState, setPromotionState] = useState<{
    isVisible: boolean;
    move: { from: string; to: string } | null;
  }>({
    isVisible: false,
    move: null,
  });
  
  // Use a ref to always have the latest game state
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const screenConfig = createPlayScreenConfig();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  // Use standardized responsive layout utilities
  const layoutType = getLayoutType(windowWidth);
  const isHorizontalLayout = layoutType !== 'mobile';
  const isDesktopLayout = layoutType === 'desktop';
  
  // On web, account for the sidebar width in board size calculation
  const hasSidebar = Platform.OS === 'web';
  
  // Calculate board size using standardized utility
  const { boardSize: BOARD_SIZE, squareSize: SQUARE_SIZE } = calculateBoardSize(
    layoutType,
    windowWidth,
    windowHeight,
    hasSidebar
  );

  useEffect(() => {
    if (!id) {
      setError('No game ID provided');
      setLoading(false);
      return;
    }

    loadGame();
  }, [id]);

  const loadGame = async () => {
    try {
      setLoading(true);
      setError(null);
      const game = await playApi.getGameById(id!);
      setGameState(game);
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const refreshGame = useCallback(async () => {
    try {
      const game = await playApi.getGameById(id!);
      setGameState(game);
      
      // Show result modal if game just ended
      if (game.status === 'ended' && !showResultModal) {
        setShowResultModal(true);
      }
    } catch (err) {
      console.error('Failed to refresh game:', err);
    }
  }, [id, playApi, showResultModal]);

  const handleMove = useCallback((from: string, to: string) => {
    const currentState = gameStateRef.current;
    
    if (!currentState || currentState.status !== 'in_progress') {
      return;
    }

    // Check if pawn promotion is needed
    const isPromotion = checkForPromotion(from, to, currentState.fen, currentState.sideToMove);
    
    if (isPromotion) {
      setPromotionState({
        isVisible: true,
        move: { from, to },
      });
      return;
    }

    // For local/offline games
    const isLocalGame = currentState.mode === 'local' || currentState.isLocal ||
                        id?.startsWith('local-');
    
    if (isLocalGame) {
      console.log('🏠 Local game - applying move locally (synchronous)');
      
      // Apply move synchronously using chess engine
      const moveStr = from + to;
      const newFen = applyMoveToFENSimple(currentState.fen, moveStr);
      
      const newMove = {
        from,
        to,
        san: moveStr,
      };
      
      const updatedGame = {
        ...currentState,
        fen: newFen,
        sideToMove: currentState.sideToMove === 'w' ? 'b' : 'w',
        moves: [...currentState.moves, newMove],
      };
      
      // Force a new object reference
      const newState = JSON.parse(JSON.stringify(updatedGame));
      setGameState(newState);
      
      console.log('✅ State set complete');
    } else {
      playApi.makeMove(id!, from, to)
        .then((updatedGame) => {
          console.log('✅ Move successful, new FEN:', updatedGame.fen);
          setGameState(updatedGame);
        })
        .catch((err) => {
          console.error('❌ Failed to make move:', err);
        });
    }
  }, [id, playApi]);

  const handlePawnPromotion = useCallback(async (piece: PieceType) => {
    if (!promotionState.move) return;

    const { from, to } = promotionState.move;
    
    try {
      // For local/offline games (detected by mode, isLocal flag, or 'local-' prefix in ID)
      const isLocalGame = gameState?.mode === 'local' || 
                          gameState?.isLocal === true || 
                          id?.startsWith('local-');
      
      if (isLocalGame && gameState) {
        const { applyMoveToFENSimple } = await import('@/core/utils/chess/engine');
        const moveStr = from + to + piece.toLowerCase();
        const newFen = applyMoveToFENSimple(gameState.fen, moveStr);
        
        const newMove = {
          from,
          to,
          promotion: piece.toLowerCase(),
          san: moveStr,
        };
        
        const updatedGame = {
          ...gameState,
          fen: newFen,
          sideToMove: gameState.sideToMove === 'w' ? 'b' : 'w',
          moves: [...gameState.moves, newMove],
        };
        
        setPromotionState({ isVisible: false, move: null });
        setGameState(updatedGame);
      } else {
        // For online games, make API call
        const updatedGame = await playApi.makeMove(id!, from, to, piece.toLowerCase());
        setPromotionState({ isVisible: false, move: null });
        setGameState(updatedGame);
      }
    } catch (err) {
      console.error('❌ Failed to make promotion move:', err);
    }
  }, [promotionState.move, gameState, id, playApi]);

  const handleResign = useCallback(async () => {
    setShowResignModal(false);
    try {
      const updatedGame = await playApi.resign(id!);
      setGameState(updatedGame);
      setShowResultModal(true);
    } catch (err) {
      console.error('❌ Failed to resign:', err);
    }
  }, [id, playApi]);

  const handleOfferDraw = useCallback(async () => {
    setShowDrawModal(false);
    try {
      // TODO: Implement draw offer API when backend is ready
      console.log('Draw offered');
      // const updatedGame = await playApi.offerDraw(id!);
      // setGameState(updatedGame);
    } catch (err) {
      console.error('❌ Failed to offer draw:', err);
    }
  }, [id]);

  const checkForPromotion = (from: string, to: string, fen: string, sideToMove: PieceColor): boolean => {
    const fromRank = from[1];
    const toRank = to[1];
    const isPawn = fen.split(' ')[0].split('/').some((rank: string) => 
      rank.includes(sideToMove === 'w' ? 'P' : 'p')
    );
    
    return isPawn && 
           ((sideToMove === 'w' && fromRank === '7' && toRank === '8') ||
            (sideToMove === 'b' && fromRank === '2' && toRank === '1'));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={[styles.loadingText, { color: colors.foreground.secondary }]}>
            Loading game...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !gameState) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || 'Game not found'}
          </Text>
        </View>
      </View>
    );
  }

  // Calculate captured pieces from FEN
  const getCapturedPieces = (fen: string): { white: string[], black: string[] } => {
    const position = fen.split(' ')[0];
    
    const startingPieces: Record<string, number> = {
      P: 8, N: 2, B: 2, R: 2, Q: 1,
      p: 8, n: 2, b: 2, r: 2, q: 1,
    };
    
    const currentPieces: Record<string, number> = {
      P: 0, N: 0, B: 0, R: 0, Q: 0,
      p: 0, n: 0, b: 0, r: 0, q: 0,
    };
    
    // Count pieces on the board
    for (const char of position) {
      if (currentPieces.hasOwnProperty(char)) {
        currentPieces[char]++;
      }
    }
    
    // Calculate captured pieces
    const whiteCaptured: string[] = []; // White captured black pieces
    const blackCaptured: string[] = []; // Black captured white pieces
    
    // White captured black pieces (lowercase)
    for (const piece of ['q', 'r', 'b', 'n', 'p']) {
      const captured = startingPieces[piece] - currentPieces[piece];
      for (let i = 0; i < captured; i++) {
        whiteCaptured.push(piece);
      }
    }
    
    // Black captured white pieces (uppercase -> lowercase for display)
    for (const piece of ['Q', 'R', 'B', 'N', 'P']) {
      const captured = startingPieces[piece] - currentPieces[piece];
      for (let i = 0; i < captured; i++) {
        blackCaptured.push(piece.toLowerCase());
      }
    }
    
    return { white: whiteCaptured, black: blackCaptured };
  };

  const capturedPieces = getCapturedPieces(gameState.fen);
  const boardOrientation = gameState.sideToMove === 'w' ? 'white' : 'black';
  const boardKey = `${gameState.fen}-${gameState.sideToMove}`;
  
  const boardProps = {
    ...getHydratedBoardProps(screenConfig),
    fen: gameState.fen,
    sideToMove: gameState.sideToMove,
    myColor: gameState.sideToMove, // Match current side to move for local play
    orientation: boardOrientation, // Flip board for each player's turn
    lastMove: gameState.moves.length > 0 ? {
      from: gameState.moves[gameState.moves.length - 1].from,
      to: gameState.moves[gameState.moves.length - 1].to,
    } : null,
    isInteractive: gameState.status === 'in_progress',
    isLocalGame: true, // Enable pass-and-play: both sides can move
    onMove: handleMove,
  };

  // Convert moves to the format expected by MoveList
  const formattedMoves: Move[] = gameState.moves.map((move: any, index: number) => ({
    moveNumber: Math.floor(index / 2) + 1,
    color: index % 2 === 0 ? 'w' : 'b',
    san: move.san || `${move.from}${move.to}`,
  }));

  return (
    <>
    <SafeAreaView style={{ flex: 1 }}>
      {/* Floating Gear Icon - Theme Settings */}
      <Pressable
        style={[styles.gearButton, { backgroundColor: colors.accent.primary }]}
        onPress={() => router.push('/settings/board-theme')}
      >
        <Text style={styles.gearIcon}>⚙️</Text>
      </Pressable>

      <Surface variant="subtle" style={{ flex: 1 }}>
        <Box flex={1} style={{ paddingHorizontal: spacingTokens[2], paddingTop: spacingTokens[4] }}>
          <VStack flex={1} gap={spacingTokens[4]}>
          {/* Game Header with Actions */}
          <Card variant="elevated" size="sm" padding={spacingTokens[3]}>
            <HStack gap={spacingTokens[2]} alignItems="center" justifyContent="space-between">
              <HStack gap={spacingTokens[2]} alignItems="center" flex={1}>
                <Text variant="caption" weight="semibold" style={{ color: colors.accent.primary }}>
                  {gameState.status === 'in_progress' ? '● LIVE' : '■ ENDED'}
                </Text>
                <Text variant="caption" color={colors.foreground.secondary}>
                  {gameState.rated !== false ? 'Rated' : 'Casual'} • {`${gameState.timeControl.initialMs / 60000}+${gameState.timeControl.incrementMs / 1000}`}
                </Text>
              </HStack>
              {gameState.status === 'in_progress' && (
                <HStack gap={spacingTokens[2]}>
                  <Text 
                    variant="caption" 
                    weight="semibold" 
                    style={{ color: colors.foreground.secondary }}
                    onPress={() => setShowDrawModal(true)}
                  >
                    ⚖️ Draw
                  </Text>
                  <Text variant="caption" color={colors.foreground.muted}>•</Text>
                  <Text 
                    variant="caption" 
                    weight="semibold" 
                    style={{ color: colors.error }}
                    onPress={() => setShowResignModal(true)}
                  >
                    🏳️ Resign
                  </Text>
                </HStack>
              )}
            </HStack>
          </Card>

          {/* Main Game Area - Responsive Layout */}
          <Box style={{ 
          flexDirection: isHorizontalLayout ? 'row' : 'column', 
          flex: 1, 
          gap: spacingTokens[4],
          alignItems: 'stretch',
        }}>
          {/* Board Column (60% on desktop, 55% on tablet) */}
          <VStack 
            flex={isHorizontalLayout ? (isDesktopLayout ? 0.6 : 0.55) : 1} 
            gap={spacingTokens[1]}
            style={{ 
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Top Player - flips with board orientation */}
            <Animated.View entering={FadeInUp.duration(250)} style={{ width: BOARD_SIZE }}>
              <PlayerCard
                color={boardOrientation === 'white' ? 'b' : 'w'}
                name={boardOrientation === 'white' 
                  ? (gameState.blackPlayer?.username || 'Player 2')
                  : (gameState.whitePlayer?.username || 'Player 1')
                }
                rating={boardOrientation === 'white'
                  ? (gameState.blackPlayer?.rating || 1500)
                  : (gameState.whitePlayer?.rating || 1500)
                }
                isSelf={boardOrientation === 'black'}
                isActive={boardOrientation === 'white' 
                  ? gameState.sideToMove === 'b'
                  : gameState.sideToMove === 'w'
                }
                remainingMs={boardOrientation === 'white'
                  ? (gameState.blackPlayer?.remainingMs || 600000)
                  : (gameState.whitePlayer?.remainingMs || 600000)
                }
                capturedPieces={boardOrientation === 'white' ? capturedPieces.black : capturedPieces.white}
                gameStatus={gameState.status}
                showRating={gameState.rated === true}
              />
            </Animated.View>

            {/* Chess Board */}
            <Animated.View entering={FadeInUp.duration(250).delay(50)} style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
              <ChessBoard
                key={boardKey}
                fen={gameState.fen}
                sideToMove={gameState.sideToMove}
                myColor={gameState.sideToMove}
                orientation={boardOrientation}
                lastMove={gameState.moves.length > 0 ? {
                  from: gameState.moves[gameState.moves.length - 1].from,
                  to: gameState.moves[gameState.moves.length - 1].to,
                } : null}
                isInteractive={gameState.status === 'in_progress'}
                isLocalGame={true}
                onMove={handleMove}
                size={BOARD_SIZE}
                squareSize={BOARD_SIZE / 8}
                boardTheme={screenConfig.boardTheme}
                themeMode={screenConfig.themeMode}
                animateMovements={true}
              />
            </Animated.View>

            {/* Bottom Player - flips with board orientation */}
            <Animated.View entering={FadeInUp.duration(250).delay(150)} style={{ width: BOARD_SIZE }}>
              <PlayerCard
                color={boardOrientation === 'white' ? 'w' : 'b'}
                name={boardOrientation === 'white'
                  ? (gameState.whitePlayer?.username || 'Player 1')
                  : (gameState.blackPlayer?.username || 'Player 2')
                }
                rating={boardOrientation === 'white'
                  ? (gameState.whitePlayer?.rating || 1500)
                  : (gameState.blackPlayer?.rating || 1500)
                }
                isSelf={boardOrientation === 'white'}
                isActive={boardOrientation === 'white'
                  ? gameState.sideToMove === 'w'
                  : gameState.sideToMove === 'b'}
                remainingMs={boardOrientation === 'white'
                  ? (gameState.whitePlayer?.remainingMs || 600000)
                  : (gameState.blackPlayer?.remainingMs || 600000)
                }
                capturedPieces={boardOrientation === 'white' ? capturedPieces.white : capturedPieces.black}
                gameStatus={gameState.status}
                showRating={gameState.rated === true}
              />
            </Animated.View>
          </VStack>

          {/* Move List - Glassmorphic Panel on desktop (40%), Card on tablet (45%) */}
          <Animated.View 
            entering={FadeInUp.duration(250).delay(100)} 
            style={{ 
              flex: isHorizontalLayout ? (isDesktopLayout ? 0.4 : 0.45) : 0,
              minHeight: isHorizontalLayout ? 0 : 300,
              maxHeight: isHorizontalLayout ? undefined : 400,
              alignSelf: 'stretch',
            }}
          >
            {isDesktopLayout ? (
              <Panel variant="glass" padding={0} style={{ flex: 1, overflow: 'hidden' }}>
                <MoveList moves={formattedMoves} />
              </Panel>
            ) : (
              <Card variant="default" size="md" padding={0} style={{ flex: 1 }}>
                <MoveList moves={formattedMoves} />
              </Card>
            )}
          </Animated.View>
        </Box>
          </VStack>
        </Box>
      </Surface>
    </SafeAreaView>    {/* Modals - Outside SafeAreaView to overlay properly */}
    <PawnPromotionModal
      visible={promotionState.isVisible}
      color={gameState.sideToMove}
      onSelect={handlePawnPromotion}
      onCancel={() => setPromotionState({ isVisible: false, move: null })}
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

    {/* Resign Confirmation Modal */}
    <Modal visible={showResignModal} transparent animationType="fade">
      <Pressable 
        style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' }}
        onPress={() => setShowResignModal(false)}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Box style={{ margin: spacingTokens[4], padding: spacingTokens[6], backgroundColor: colors.background.primary, borderRadius: radiusTokens.lg, minWidth: 280 }}>
            <VStack gap={spacingTokens[4]}>
              <Text variant="heading" weight="bold">🏳️ Resign Game?</Text>
              <Text variant="body" color={colors.foreground.secondary}>
                Are you sure you want to resign? This will end the game immediately and count as a loss.
              </Text>
              <HStack gap={spacingTokens[2]}>
                <Button variant="outline" onPress={() => setShowResignModal(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="solid" onPress={handleResign} style={{ flex: 1, backgroundColor: colors.error }}>Resign</Button>
              </HStack>
            </VStack>
          </Box>
        </Pressable>
      </Pressable>
    </Modal>

    {/* Draw Offer Confirmation Modal */}
    <Modal visible={showDrawModal} transparent animationType="fade">
      <Pressable 
        style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' }}
        onPress={() => setShowDrawModal(false)}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Box style={{ margin: spacingTokens[4], padding: spacingTokens[6], backgroundColor: colors.background.primary, borderRadius: radiusTokens.lg, minWidth: 280 }}>
            <VStack gap={spacingTokens[4]}>
              <Text variant="heading" weight="bold">⚖️ Offer Draw?</Text>
              <Text variant="body" color={colors.foreground.secondary}>
                Your opponent will receive a draw offer. They can accept or decline.
              </Text>
              <HStack gap={spacingTokens[2]}>
                <Button variant="outline" onPress={() => setShowDrawModal(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="solid" onPress={handleOfferDraw} style={{ flex: 1 }}>Offer Draw</Button>
              </HStack>
            </VStack>
          </Box>
        </Pressable>
      </Pressable>
    </Modal>
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
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
