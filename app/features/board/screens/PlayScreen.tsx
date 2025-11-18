/**
 * Enhanced PlayScreen with AI-Inspired Design
 * Features: proper spacing, depth, gradients, smooth animations
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Platform, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { ChessBoard } from '@/features/board';
import { GameActions, MoveList, PlayerPanel, type Move } from '@/features/game';
import { createPlayScreenConfig, getHydratedBoardProps, type PlayScreenConfig } from '@/features/board/config';
import { isCheckmate, isStalemate, parseFENToBoard, applyMoveToFENSimple, type Board } from '@/core/utils';
import { Box, VStack, HStack, Text, useColors } from '@/ui';
import { Card } from '@/ui/primitives/Card';

const { width } = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && width >= 1024;
const isTablet = Platform.OS === 'web' && width >= 768 && width < 1024;

export interface PlayScreenProps {
  gameId: string;
  screenConfig?: Partial<PlayScreenConfig>;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({ 
  gameId, 
  screenConfig 
}) => {
  const screenConfigObj = createPlayScreenConfig(screenConfig);
  const colors = useColors();

  const [gameState, setGameState] = useState({
    status: 'in_progress' as 'in_progress' | 'ended',
    players: ['Player 1', 'Player 2'],
    moves: [] as Move[],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    sideToMove: 'w' as 'w' | 'b',
    endReason: '',
    lastMove: null as { from: string; to: string } | null,
  });

  const handleMove = (from: string, to: string) => {
    // Calculate move number: white moves increment, black moves use same number
    const newMoveNumber = gameState.sideToMove === 'w' 
      ? Math.floor(gameState.moves.length / 2) + 1
      : Math.floor(gameState.moves.length / 2) + 1;
    
    const playerColor = gameState.sideToMove === 'w' ? 'White' : 'Black';
    const moveAlgebraic = `${from}${to}`;
    
    const nextSideToMove = gameState.sideToMove === 'w' ? 'b' : 'w';
    const newFEN = applyMoveToFENSimple(gameState.fen, moveAlgebraic);
    const board: Board = parseFENToBoard(newFEN);
    
    let newStatus: 'in_progress' | 'ended' = 'in_progress';
    let endReason = '';
    
    if (isCheckmate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = `Checkmate! ${playerColor} wins!`;
    } else if (isStalemate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = 'Stalemate - Game is a draw';
    }
    
    const moveObj: Move = {
      moveNumber: newMoveNumber,
      color: gameState.sideToMove,
      san: moveAlgebraic
    };

    setGameState(prev => ({
      ...prev,
      moves: [...prev.moves, moveObj],
      fen: newFEN,
      sideToMove: nextSideToMove,
      status: newStatus,
      endReason: endReason,
      lastMove: { from, to },
    }));
  };

  const handleResign = () => {
    console.log('Player resigned');
  };

  // Use responsive board configuration from config
  const responsiveBoardConfig = {
    ...screenConfigObj.board,
    size: isDesktop ? 540 : isTablet ? 480 : Math.min(width - 48, 420),
  };
  responsiveBoardConfig.squareSize = responsiveBoardConfig.size / 8;

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      {Platform.OS === 'web' && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
          <LinearGradient
            colors={['#F8F9FA', '#FFFFFF', '#F8F9FA']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          isDesktop && styles.desktopLayout,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Game Area */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          layout={Layout.springify().damping(15)}
          style={[styles.mainArea, isDesktop ? styles.mainAreaDesktop : null].filter(Boolean)}
        >
          {/* Top Player Panel */}
          <Card
            variant="glass"
            size="md"
            style={styles.playerCard}
          >
            <PlayerPanel
              position="top"
              color={gameState.sideToMove === 'w' ? 'b' : 'w'}
              isSelf={false}
              remainingMs={600000}
              accountId="Opponent"
              isActive={gameState.sideToMove !== 'w'}
            />
          </Card>

          {/* Chess Board */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(200)}
            style={styles.boardWrapper}
          >
            <Card
              variant="elevated"
              size="lg"
              pressable
              style={styles.boardCard}
            >
              <ChessBoard
                {...getHydratedBoardProps(screenConfigObj)}
                size={responsiveBoardConfig.size}
                squareSize={responsiveBoardConfig.squareSize}
                fen={gameState.fen}
                sideToMove={gameState.sideToMove}
                myColor={gameState.sideToMove}
                orientation={gameState.sideToMove === 'w' ? 'white' : 'black'}
                onMove={handleMove}
                isInteractive={gameState.status === 'in_progress'}
                lastMove={gameState.lastMove}
              />
            </Card>
          </Animated.View>

          {/* Bottom Player Panel */}
          <Card
            variant="glass"
            size="md"
            style={styles.playerCard}
          >
            <PlayerPanel
              position="bottom"
              color="w"
              isSelf={true}
              remainingMs={600000}
              accountId="You"
              isActive={gameState.sideToMove === 'w'}
            />
          </Card>

          {/* Game Actions */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(300)}
            style={styles.actionsWrapper}
          >
            <Card variant="outline" size="md">
              <GameActions
                status={gameState.status}
                result={gameState.status === 'ended' ? '1-0' : null}
                endReason={gameState.endReason}
                onResign={handleResign}
              />
            </Card>
          </Animated.View>
        </Animated.View>

        {/* Sidebar: Moves & Info */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          layout={Layout.springify().damping(15)}
          style={[styles.sidebar, isDesktop ? styles.sidebarDesktop : null].filter(Boolean)}
        >
          {/* Game Status Card */}
          <Card
            variant="gradient"
            gradient={['#667EEA', '#764BA2']}
            size="md"
            style={styles.statusCard}
          >
            <VStack gap={2}>
              <Text style={styles.statusLabel}>Game Status</Text>
              <Text style={styles.statusValue}>
                {gameState.status === 'in_progress' ? 'In Progress' : 'Ended'}
              </Text>
              <Text style={styles.statusSubtext}>
                {gameState.sideToMove === 'w' ? 'White' : 'Black'} to move
              </Text>
            </VStack>
          </Card>

          {/* Move List */}
          <Card
            variant="elevated"
            size="md"
            style={styles.movesCard}
          >
            <Text style={styles.sectionTitle}>Moves</Text>
            <View style={styles.moveListWrapper}>
              <MoveList moves={gameState.moves} />
            </View>
          </Card>

          {/* Configuration Card */}
          <Card variant="default" size="md">
            <VStack gap={3}>
              <Text style={styles.sectionTitle}>Configuration</Text>
              <HStack gap={2} style={styles.configRow}>
                <Text style={styles.configLabel}>Time Control:</Text>
                <Text style={styles.configValue}>10+0</Text>
              </HStack>
              <HStack gap={2} style={styles.configRow}>
                <Text style={styles.configLabel}>Rated:</Text>
                <Text style={styles.configValue}>Yes</Text>
              </HStack>
              <HStack gap={2} style={styles.configRow}>
                <Text style={styles.configLabel}>Game ID:</Text>
                <Text style={[styles.configValue, styles.gameId]}>{gameId}</Text>
              </HStack>
            </VStack>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    gap: 24,
    minHeight: '100%',
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: 32,
    paddingHorizontal: 48,
    paddingVertical: 32,
  },
  mainArea: {
    flex: 1,
    gap: 20,
    alignItems: 'center',
  },
  mainAreaDesktop: {
    maxWidth: 700,
  },
  playerCard: {
    width: '100%',
    maxWidth: 600,
  },
  boardWrapper: {
    marginVertical: 8,
  },
  boardCard: {
    padding: 0,
    overflow: 'hidden',
  },
  actionsWrapper: {
    width: '100%',
    maxWidth: 600,
    marginTop: 8,
  },
  sidebar: {
    gap: 20,
    width: '100%',
  },
  sidebarDesktop: {
    width: 360,
    minWidth: 360,
  },
  statusCard: {
    minHeight: 120,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statusSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  movesCard: {
    flex: 1,
    minHeight: 300,
  },
  moveListWrapper: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  configRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  configLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  configValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  gameId: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', web: 'monospace' }),
    fontSize: 13,
  },
});
