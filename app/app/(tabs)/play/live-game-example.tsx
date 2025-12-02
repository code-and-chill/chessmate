/**
 * Live Game Screen Example
 * app/app/(tabs)/play/live-game-example.tsx
 * 
 * Complete production example demonstrating all chess-specific DLS components
 * Shows: GameClock, MoveList, ResultDialog, EvaluationBar in active game context
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Text,
  Button,
  Card,
  ComponentStateManager,
  GameClock,
  MoveList,
  EvaluationBar,
  ResultDialog,
  spacingScale,
  spacingTokens,
  colorTokens,
  getColor,
  textVariants,
  radiusTokens,
} from '@/ui';
import type { Move, ResultReason } from '@/ui';

type GameStatus = 'active' | 'ended' | 'paused';

export default function LiveGameExample() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('active');
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white');
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes
  const [blackTime, setBlackTime] = useState(600);
  const [evaluation, setEvaluation] = useState(0.5);
  const [showResult, setShowResult] = useState(false);

  // Sample moves
  const [moves, setMoves] = useState<Move[]>([
    {
      moveNumber: 1,
      white: { san: 'e4', from: 'e2', to: 'e4', timestamp: 595 },
      black: { san: 'e5', from: 'e7', to: 'e5', timestamp: 592 },
    },
    {
      moveNumber: 2,
      white: { san: 'Nf3', from: 'g1', to: 'f3', timestamp: 588 },
      black: { san: 'Nc6', from: 'b8', to: 'c6', timestamp: 585 },
    },
    {
      moveNumber: 3,
      white: { san: 'Bb5', from: 'f1', to: 'b5', timestamp: 580 },
      black: { san: 'a6', from: 'a7', to: 'a6', timestamp: 575 },
    },
    {
      moveNumber: 4,
      white: { san: 'Ba4', from: 'b5', to: 'a4', timestamp: 572 },
      black: { san: 'Nf6', from: 'g8', to: 'f6', timestamp: 568 },
    },
    {
      moveNumber: 5,
      white: { san: 'O-O', from: 'e1', to: 'g1', timestamp: 565 },
      black: { san: 'Be7', from: 'f8', to: 'e7', timestamp: 560 },
    },
    {
      moveNumber: 6,
      white: { san: 'Re1', from: 'f1', to: 'e1', timestamp: 558 },
    },
  ]);

  const [currentMoveIndex, setCurrentMoveIndex] = useState(11); // At move 6 for white

  const handleMakeMove = () => {
    // Simulate making a move
    const nextMoveNumber = Math.floor(moves.length) + 1;
    
    if (currentTurn === 'black') {
      // Complete the move pair
      setMoves([
        ...moves,
        {
          ...moves[moves.length - 1],
          black: {
            san: 'b5',
            from: 'b7',
            to: 'b5',
            timestamp: blackTime - 3,
          },
        },
      ]);
      setBlackTime(blackTime - 3 + 5); // Subtract time + add increment
      setCurrentMoveIndex(currentMoveIndex + 1);
      setEvaluation(evaluation + 0.3); // Slightly favor white
      setCurrentTurn('white');
    } else {
      // Start new move pair
      setMoves([
        ...moves,
        {
          moveNumber: nextMoveNumber,
          white: {
            san: 'Bb3',
            from: 'a4',
            to: 'b3',
            timestamp: whiteTime - 2,
          },
        },
      ]);
      setWhiteTime(whiteTime - 2 + 5); // Subtract time + add increment
      setCurrentMoveIndex(currentMoveIndex + 1);
      setEvaluation(evaluation + 0.2); // Slightly favor white
      setCurrentTurn('black');
    }
  };

  const handleResign = () => {
    setGameStatus('ended');
    setShowResult(true);
  };

  const handlePause = () => {
    setGameStatus(gameStatus === 'paused' ? 'active' : 'paused');
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: getColor(colorTokens.neutral[50], false) },
      ]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(300).delay(100)}
        style={styles.header}
      >
        <View>
          <Text
            {...textVariants.title}
            style={{ color: getColor(colorTokens.neutral[900], false) }}
          >
            Live Game
          </Text>
          <Text
            {...textVariants.body}
            style={{ color: getColor(colorTokens.neutral[600], false) }}
          >
            10+5 • Rapid
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            onPress={handlePause}
            accessibilityLabel={gameStatus === 'paused' ? 'Resume game' : 'Pause game'}
          >
            {gameStatus === 'paused' ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onPress={handleResign}
            accessibilityLabel="Resign game"
          >
            Resign
          </Button>
        </View>
      </Animated.View>

      {/* Game Status */}
      {gameStatus === 'paused' && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={[
            styles.pausedBanner,
            { backgroundColor: getColor(colorTokens.orange[100], false) },
          ]}
        >
          <Text
            {...textVariants.body}
            style={{ color: getColor(colorTokens.orange[900], false) }}
          >
            ⏸️ Game paused
          </Text>
        </Animated.View>
      )}

      {/* Player Section - Black */}
      <Animated.View entering={FadeInDown.duration(300).delay(200)}>
        <Card variant="elevated" size="sm">
          <View style={styles.playerSection}>
            <View style={styles.playerInfo}>
              <View style={styles.playerHeader}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: getColor(colorTokens.neutral[800], false) },
                  ]}
                  accessibilityLabel="Black pieces"
                />
                <Text
                  {...textVariants.body}
                  style={[
                    styles.playerName,
                    { color: getColor(colorTokens.neutral[900], false) },
                  ]}
                >
                  Opponent123
                </Text>
                <Text
                  {...textVariants.caption}
                  style={{ color: getColor(colorTokens.neutral[600], false) }}
                >
                  (1680)
                </Text>
              </View>
            </View>
            <GameClock
              timeRemaining={blackTime}
              increment={5}
              isActive={currentTurn === 'black' && gameStatus === 'active'}
              isPaused={gameStatus === 'paused'}
              player="black"
              onTimeUp={() => {
                setGameStatus('ended');
                setShowResult(true);
              }}
            />
          </View>
        </Card>
      </Animated.View>

      {/* Evaluation Bar */}
      <Animated.View
        entering={FadeInDown.duration(300).delay(300)}
        style={styles.evaluationContainer}
      >
        <EvaluationBar evaluation={evaluation} height={12} />
      </Animated.View>

      {/* Chessboard Placeholder */}
      <Animated.View entering={FadeInDown.duration(300).delay(400)}>
        <Card variant="elevated" size="md">
          <View
            style={[
              styles.boardPlaceholder,
              { backgroundColor: getColor(colorTokens.neutral[100], false) },
            ]}
            accessibilityRole="img"
            accessibilityLabel="Chess board with current position"
          >
            <Text
              {...textVariants.title}
              style={{ color: getColor(colorTokens.neutral[500], false) }}
            >
              ♔ ♕ ♖ ♗ ♘ ♙
            </Text>
            <Text
              {...textVariants.body}
              style={{
                color: getColor(colorTokens.neutral[600], false),
                marginTop: spacingTokens[2],
              }}
            >
              Chessboard Component
            </Text>
            <Text
              {...textVariants.caption}
              style={{
                color: getColor(colorTokens.neutral[500], false),
                marginTop: spacingTokens[1],
              }}
            >
              (To be rendered by features/board)
            </Text>
          </View>
        </Card>
      </Animated.View>

      {/* Player Section - White (You) */}
      <Animated.View entering={FadeInDown.duration(300).delay(500)}>
        <Card variant="elevated" size="sm">
          <View style={styles.playerSection}>
            <View style={styles.playerInfo}>
              <View style={styles.playerHeader}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: getColor(colorTokens.neutral[100], false) },
                  ]}
                  accessibilityLabel="White pieces"
                />
                <Text
                  {...textVariants.body}
                  style={[
                    styles.playerName,
                    { color: getColor(colorTokens.neutral[900], false) },
                  ]}
                >
                  You
                </Text>
                <Text
                  {...textVariants.caption}
                  style={{ color: getColor(colorTokens.neutral[600], false) }}
                >
                  (1725)
                </Text>
              </View>
            </View>
            <GameClock
              timeRemaining={whiteTime}
              increment={5}
              isActive={currentTurn === 'white' && gameStatus === 'active'}
              isPaused={gameStatus === 'paused'}
              player="white"
              onTimeUp={() => {
                setGameStatus('ended');
                setShowResult(true);
              }}
            />
          </View>
        </Card>
      </Animated.View>

      {/* Move List */}
      <Animated.View
        entering={FadeInDown.duration(300).delay(600)}
        style={styles.moveListContainer}
      >
        <MoveList
          moves={moves}
          currentMoveIndex={currentMoveIndex}
          onMovePress={(index) => {
            setCurrentMoveIndex(index);
            console.log('Jump to move:', index);
          }}
          variant="detailed"
          showTimestamps={true}
          showAnnotations={true}
        />
      </Animated.View>

      {/* Action Button */}
      {gameStatus === 'active' && (
        <Animated.View entering={FadeInDown.duration(300).delay(700)}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleMakeMove}
            style={styles.moveButton}
            accessibilityLabel={`Make move as ${currentTurn}`}
            accessibilityHint="Tap to make your next move"
          >
            {currentTurn === 'white' ? 'Make Move (White)' : 'Make Move (Black)'}
          </Button>
        </Animated.View>
      )}

      {/* Result Dialog */}
      <ResultDialog
        visible={showResult}
        result="loss"
        reason="resignation"
        winner="black"
        playerColor="white"
        opponentName="Opponent123"
        stats={{
          duration: 420, // 7 minutes
          totalMoves: 12,
          accuracy: {
            player: 88,
            opponent: 92,
          },
          ratingChange: {
            player: -8,
            opponent: +8,
          },
        }}
        onClose={() => setShowResult(false)}
        onRematch={() => {
          setShowResult(false);
          console.log('Rematch requested');
        }}
        onReview={() => {
          setShowResult(false);
          console.log('Review game');
        }}
        onNewGame={() => {
          setShowResult(false);
          console.log('New game');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacingScale.gutter,
    gap: spacingTokens[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacingTokens[2],
  },
  pausedBanner: {
    padding: spacingTokens[3],
    borderRadius: radiusTokens.md,
    alignItems: 'center',
  },
  playerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerInfo: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingTokens[2],
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: radiusTokens.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  playerName: {
    fontWeight: '600',
  },
  evaluationContainer: {
    marginVertical: -spacingTokens[2],
  },
  boardPlaceholder: {
    aspectRatio: 1,
    borderRadius: radiusTokens.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveListContainer: {
    height: 300,
  },
  moveButton: {
    width: '100%',
  },
});
