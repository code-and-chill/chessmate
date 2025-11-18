import { useState } from 'react';
import { ScrollView, Platform } from 'react-native';
import { ChessBoard, GameActions, MoveList, PlayerPanel, type Move } from '@/components/compound';
import { createPlayScreenConfig, getHydratedBoardProps, type PlayScreenConfig } from '@/components/config';
import { isCheckmate, isStalemate, parseFENToBoard, applyMoveToFENSimple, type Board } from '@/utils/chessEngine';
import { Box, VStack, Text, useColors } from '@/ui';

// Move application now handled by engine util: applyMoveToFENSimple

/**
 * PlayScreen Props
 */
export interface PlayScreenProps {
  gameId: string;
  screenConfig?: Partial<PlayScreenConfig>;
}

/**
 * PlayScreen Component
 *
 * Main component for displaying an active chess game.
 * Currently a placeholder that displays game information.
 *
 * Features:
 * - Shows game ID
 * - Loading states
 * - Responsive layout
 */
export const PlayScreen = ({ gameId, screenConfig }: PlayScreenProps) => {
  const screenConfigObj = createPlayScreenConfig(screenConfig);

  const [gameState, setGameState] = useState({
    status: 'in_progress' as 'in_progress' | 'ended',
    players: ['Player 1', 'Player 2'],
    moves: [] as Move[],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    sideToMove: 'w' as 'w' | 'b',
    endReason: '',
  });

    const handleMove = (from: string, to: string) => {
    const newMoveNumber = gameState.moves.length + 1;
    const playerColor = gameState.sideToMove === 'w' ? 'White' : 'Black';
    const moveAlgebraic = `${from}${to}`;
    
    console.log(`\n[PLAY_SCREEN] Move #${newMoveNumber}: ${playerColor} moves ${from} → ${to}`);
    console.log(`[PLAY_SCREEN] Side to move BEFORE: ${gameState.sideToMove}`);
    
    // Determine the next side to move
    const nextSideToMove = gameState.sideToMove === 'w' ? 'b' : 'w';
    
    // Calculate new FEN after move
    const newFEN = applyMoveToFENSimple(gameState.fen, moveAlgebraic);
    console.log(`[PLAY_SCREEN] FEN updated: ${newFEN}`);
    
    // Convert FEN to engine Board (Piece objects)
    const board: Board = parseFENToBoard(newFEN);
    
    // Check for checkmate or stalemate for opponent
    let newStatus: 'in_progress' | 'ended' = 'in_progress';
    let endReason = '';
    
    if (isCheckmate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = `Checkmate! ${playerColor} wins!`;
      console.log(`[PLAY_SCREEN] CHECKMATE DETECTED: ${playerColor} wins!`);
    } else if (isStalemate(board, nextSideToMove)) {
      newStatus = 'ended';
      endReason = 'Stalemate - Game is a draw';
      console.log(`[PLAY_SCREEN] STALEMATE DETECTED: Game is a draw`);
    }
    
    // Create the move object
    const moveObj: Move = {
      moveNumber: newMoveNumber,
      color: gameState.sideToMove,
      san: moveAlgebraic
    };

    const updatedMoves = [...gameState.moves, moveObj];

    // Update state
    setGameState(prev => ({
      ...prev,
      moves: updatedMoves,
      fen: newFEN,
      sideToMove: nextSideToMove,
      status: newStatus,
      endReason: endReason,
    }));

    console.log(`[PLAY_SCREEN] Side to move AFTER: ${nextSideToMove}`);
    console.log(`[PLAY_SCREEN] Total moves: ${updatedMoves.length}`);
  };

  const handleResign = () => {
    console.log('Player resigned');
  };

  const colors = useColors();

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
            Live Chess Game
          </Text>
          <Text
            variant="caption"
            color={colors.foreground.tertiary}
            style={{ fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier New' }}
          >
            Game ID: {gameId}
          </Text>
        </VStack>

        {/* Opponent Panel */}
        <PlayerPanel
          position="top"
          color="b"
          isSelf={false}
          isActive={gameState.sideToMove === 'b'}
          remainingMs={600000}
          accountId="opponent123"
        />

        {/* Chess Board */}
        <Box
          padding={3}
          backgroundColor={colors.background.secondary}
          radius="md"
          style={{ alignItems: 'center', marginBottom: 24 }}
        >
          <ChessBoard
            {...getHydratedBoardProps(screenConfigObj)}
            fen={gameState.fen}
            sideToMove={gameState.sideToMove}
            myColor={gameState.sideToMove}
            isInteractive={gameState.status === 'in_progress'}
            onMove={handleMove}
          />
        </Box>

        {/* Self Player Panel */}
        <PlayerPanel
          position="bottom"
          color="w"
          isSelf={true}
          isActive={gameState.sideToMove === 'w'}
          remainingMs={300000}
          accountId="you123"
        />

        {/* Game Actions */}
        <GameActions
          status={gameState.status}
          endReason={gameState.endReason}
          onResign={handleResign}
        />

        {/* Move List */}
        <Box style={{ marginBottom: 20 }}>
          <MoveList moves={gameState.moves} />
        </Box>

        {/* Game Status */}
        <Box
          padding={3}
          backgroundColor={colors.background.secondary}
          radius="md"
          style={{ marginBottom: 20 }}
        >
          <VStack gap={2}>
            <Text variant="subheading" color={colors.foreground.primary}>
              Game Status
            </Text>
            <Text variant="body" color={colors.foreground.secondary}>
              Status: {gameState.status}
            </Text>
            <Text variant="body" color={colors.foreground.secondary}>
              Players: {gameState.players.join(' vs ')}
            </Text>
          </VStack>
        </Box>

        {/* Configuration */}
        <Box
          padding={3}
          backgroundColor={colors.background.secondary}
          radius="md"
        >
          <VStack gap={2}>
            <Text variant="subheading" color={colors.foreground.primary}>
              Configuration
            </Text>
            <Text variant="caption" color={colors.foreground.tertiary}>
              Board Size: {screenConfigObj.board.size}px
            </Text>
            <Text variant="caption" color={colors.foreground.tertiary}>
              Board Theme: {screenConfigObj.theme.boardTheme}
            </Text>
            <Text variant="caption" color={colors.foreground.tertiary}>
              Theme Mode: {screenConfigObj.theme.mode}
            </Text>
            <Text variant="caption" color={colors.foreground.tertiary}>
              API Base: {screenConfigObj.apiBaseUrl}
            </Text>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
};
