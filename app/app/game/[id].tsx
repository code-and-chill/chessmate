import { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClients } from '@/contexts/ApiContext';
import { useThemeTokens } from '@/ui';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  GameActions, 
  GameHeaderCard,
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
import { VStack } from '@/ui/primitives/Stack';
import { Card } from '@/ui/primitives/Card';
import { spacingTokens } from '@/ui/tokens/spacing';
import { applyMoveToFENSimple } from '@/core/utils/chess/engine';

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
  const BOARD_SIZE = Math.min(Dimensions.get('window').width - 48, 420);

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
      setGameState(game);
    } catch (err) {
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
  }, [id, showResultModal]);

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
    const isLocalGame = currentState.mode === 'local' || 
                        currentState.isLocal === true || 
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
  }, [promotionState, id, gameState]);

  const handleResign = useCallback(async () => {
    try {
      const updatedGame = await playApi.resign(id!);
      setGameState(updatedGame);
      setShowResultModal(true);
    } catch (err) {
      console.error('❌ Failed to resign:', err);
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
    <Box flex={1} style={{ backgroundColor: colors.background.primary, padding: spacingTokens[4] }}>
      <VStack flex={1} gap={spacingTokens[4]}>
        {/* Game Header */}
        <GameHeaderCard
          status={gameState.status === 'in_progress' ? 'live' : 'ended'}
          gameMode="Local Play"
          timeControl={`${gameState.timeControl.initialMs / 60000}+${gameState.timeControl.incrementMs / 1000}`}
          isRated={false}
        />

        {/* Main Game Area */}
        <Box style={{ flexDirection: 'row', flex: 1, gap: spacingTokens[4] }}>
          <VStack flex={1} gap={spacingTokens[4]}>
            {/* Top Player */}
            <Animated.View entering={FadeInUp.duration(250)}>
              <PlayerCard
                color="b"
                name={gameState.blackPlayer?.username || 'Player 2'}
                rating={gameState.blackPlayer?.rating || 1500}
                isSelf={false}
                isActive={gameState.sideToMove === 'b'}
                remainingMs={gameState.blackPlayer?.remainingMs || 600000}
              />
            </Animated.View>

            {/* Chess Board */}
            <Animated.View entering={FadeInUp.duration(250).delay(50)} style={{ alignItems: 'center' }}>
              <Card variant="elevated" size="md" padding={0}>
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
                />
              </Card>
            </Animated.View>

            {/* Bottom Player */}
            <Animated.View entering={FadeInUp.duration(250).delay(150)}>
              <PlayerCard
                color="w"
                name={gameState.whitePlayer?.username || 'Player 1'}
                rating={gameState.whitePlayer?.rating || 1500}
                isSelf={true}
                isActive={gameState.sideToMove === 'w'}
                remainingMs={gameState.whitePlayer?.remainingMs || 600000}
              />
            </Animated.View>

            {/* Game Actions */}
            <Animated.View entering={FadeInUp.duration(250).delay(200)}>
              <GameActions
                status={gameState.status}
                result={gameState.result}
                endReason={gameState.endReason}
                sideToMove={gameState.sideToMove}
                onResign={handleResign}
                onOfferDraw={() => console.log('Draw offered')}
              />
            </Animated.View>
          </VStack>

          {/* Move List */}
          <Animated.View entering={FadeInUp.duration(250).delay(100)} style={{ flex: 1 }}>
            <Card variant="default" size="md" padding={0} style={{ flex: 1 }}>
              <MoveList moves={formattedMoves} />
            </Card>
          </Animated.View>
        </Box>
      </VStack>

      {/* Modals */}
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
    </Box>
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
});
