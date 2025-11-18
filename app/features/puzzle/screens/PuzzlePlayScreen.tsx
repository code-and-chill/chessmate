import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { ChessBoard } from '@/features/board';
import { MoveList, PlayerPanel, GameActions } from '@/features/game';
import { createPlayScreenConfig, getHydratedBoardProps, type PlayScreenConfig } from '@/features/board/config';
import { isCheckmate, isStalemate, parseFENToBoard, applyMoveToFENSimple, type Board } from '@/core/utils';
import { Box, VStack, HStack, Text, Button, useColors } from '@/ui';

// Move application now handled by engine util: applyMoveToFENSimple

interface PuzzlePlayScreenProps {
  puzzleId: string;
  onComplete?: (data: Record<string, unknown>) => void;
  screenConfig?: Partial<PlayScreenConfig>;
}

/**
 * PuzzlePlayScreen Component
 *
 * Displays a chess puzzle for the user to solve.
 * Currently a placeholder showing puzzle information.
 */
export const PuzzlePlayScreen = ({
  puzzleId,
  onComplete,
  screenConfig,
}: PuzzlePlayScreenProps) => {
  const screenConfigObj = createPlayScreenConfig(screenConfig);
  const [status, setStatus] = useState('');
  const [error] = useState<string | null>(null);
  const [puzzleState, setPuzzleState] = useState({
    status: 'in_progress' as 'in_progress' | 'ended',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 4',
    moves: [] as Move[],
    sideToMove: 'w' as 'w' | 'b',
    endReason: '',
  });

  const handleMove = (from: string, to: string) => {
    const newMoveNumber = puzzleState.moves.length + 1;
    const playerColor = puzzleState.sideToMove === 'w' ? 'White' : 'Black';
    const moveAlgebraic = `${from}${to}`;
    
    console.log(`
[PUZZLE_SCREEN] Move #${newMoveNumber}: ${playerColor} moves ${from} → ${to}`);
    console.log(`[PUZZLE_SCREEN] Side to move BEFORE: ${puzzleState.sideToMove}`);
    
    // Determine the next side to move
    const nextSideToMove = puzzleState.sideToMove === 'w' ? 'b' : 'w';
    
    // Calculate new FEN after move
    const newFEN = applyMoveToFENSimple(puzzleState.fen, moveAlgebraic);
    console.log(`[PUZZLE_SCREEN] FEN updated: ${newFEN}`);
    
    // Convert FEN to engine Board (Piece objects)
    const board: Board = parseFENToBoard(newFEN);
    
    // Check for checkmate or stalemate for opponent
    let newStatus: 'in_progress' | 'ended' = 'in_progress';
    let endReason = '';
    
    if (isCheckmate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = `Puzzle Solved! ${playerColor} wins!`;
      console.log(`[PUZZLE_SCREEN] CHECKMATE DETECTED: ${playerColor} wins!`);
    } else if (isStalemate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = 'Stalemate - Game is a draw';
      console.log(`[PUZZLE_SCREEN] STALEMATE DETECTED: Game is a draw`);
    }
    
    // Create the move object
    const moveObj: Move = {
      moveNumber: newMoveNumber,
      color: puzzleState.sideToMove,
      san: moveAlgebraic
    };

    const updatedMoves = [...puzzleState.moves, moveObj];

    // Update state
    setPuzzleState(prev => ({
      ...prev,
      moves: updatedMoves,
      fen: newFEN,
      sideToMove: nextSideToMove,
      status: newStatus,
      endReason: endReason,
    }));

    console.log(`[PUZZLE_SCREEN] Side to move AFTER: ${nextSideToMove}`);
    console.log(`[PUZZLE_SCREEN] Total moves: ${updatedMoves.length}`);
  };

  const handleSubmit = () => {
    setStatus('Puzzle submitted!');
    if (onComplete) {
      onComplete({
        puzzleId,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const colors = useColors();

  if (error) {
    return (
      <Box flex={1} backgroundColor={colors.background.primary} style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text variant="body" color={colors.error} style={{ textAlign: 'center' }}>
          {error}
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor={colors.background.primary}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <VStack gap={2} style={{ marginBottom: 24 }}>
          <Text variant="heading" color={colors.foreground.primary}>
            Daily Puzzle
          </Text>
          <Text
            variant="caption"
            color={colors.foreground.tertiary}
            style={{ fontFamily: 'monospace' }}
          >
            Puzzle ID: {puzzleId}
          </Text>
        </VStack>

        {/* Puzzle Author Panel */}
        <PlayerPanel
          position="top"
          color="b"
          isSelf={false}
          isActive={puzzleState.sideToMove === 'b'}
          remainingMs={0}
          accountId="puzzle_author"
        />

        {/* Chess Board */}
        <Box
          padding={3}
          backgroundColor={colors.background.secondary}
          radius="md"
          style={{ alignItems: 'center', marginBottom: 20 }}
        >
          <ChessBoard
            {...getHydratedBoardProps(screenConfigObj)}
            fen={puzzleState.fen}
            sideToMove={puzzleState.sideToMove}
            myColor={puzzleState.sideToMove}
            isInteractive={puzzleState.status === 'in_progress'}
            onMove={handleMove}
          />
        </Box>

        {/* Self Panel */}
        <PlayerPanel
          position="bottom"
          color="w"
          isSelf={true}
          isActive={puzzleState.sideToMove === 'w'}
          remainingMs={0}
          accountId="you123"
        />

        {/* Game Actions */}
        <GameActions
          status={puzzleState.status}
          endReason={puzzleState.endReason}
        />

        {/* Move List */}
        <Box style={{ marginBottom: 16 }}>
          <MoveList moves={puzzleState.moves} />
        </Box>

        {/* Puzzle Info */}
        <Box
          padding={3}
          backgroundColor={colors.background.secondary}
          radius="md"
          style={{ marginBottom: 16 }}
        >
          <VStack gap={2}>
            <HStack justifyContent="space-between">
              <Text variant="body" color={colors.foreground.primary}>
                Difficulty:
              </Text>
              <Text variant="body" color={colors.accent.primary} weight="600">
                Medium
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text variant="body" color={colors.foreground.primary}>
                Rating:
              </Text>
              <Text variant="body" color={colors.accent.primary} weight="600">
                1200
              </Text>
            </HStack>
            <Text variant="caption" color={colors.foreground.tertiary}>
              Board Theme: {screenConfigObj.theme.boardTheme}
            </Text>
            <Text variant="caption" color={colors.foreground.tertiary}>
              API Base: {screenConfigObj.apiBaseUrl}
            </Text>
          </VStack>
        </Box>

        {/* Status Message */}
        {status && (
          <Box style={{ marginBottom: 16 }}>
            <Text
              variant="body"
              color={colors.info}
              style={{ textAlign: 'center' }}
            >
              {status}
            </Text>
          </Box>
        )}

        {/* Submit Button */}
        <Box style={{ marginTop: 20, marginBottom: 20 }}>
          <Button
            variant="solid"
            color="blue"
            size="lg"
            onPress={handleSubmit}
          >
            ✓ Submit Solution
          </Button>
        </Box>
      </ScrollView>
    </Box>
  );
};