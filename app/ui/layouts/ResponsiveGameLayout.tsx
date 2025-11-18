import type React from 'react';
import { View, StyleSheet, ScrollView, Platform, useColorScheme } from 'react-native';
import { ChessBoard, type ChessBoardProps } from '@/features/board';
import { PlayerPanel, type PlayerPanelProps, MoveList, type Move, GameActions, type GameActionsProps } from '@/features/game';
import {
  getBoardSize,
  getSquareSize,
  shouldShowMoveListSideBySide,
  Spacing,
} from '@/core/constants';
import { Colors } from '@/core/constants';

export interface ResponsiveGameLayoutProps {
  // Board props
  boardProps: Omit<ChessBoardProps, 'size' | 'squareSize'>;
  
  // Player props
  topPlayerProps: Omit<PlayerPanelProps, 'position'>;
  bottomPlayerProps: Omit<PlayerPanelProps, 'position'>;
  
  // Game state
  moves?: Move[];
  gameActionsProps?: GameActionsProps;
}

/**
 * ResponsiveGameLayout Component
 * 
 * Responsive layout for chess games that adapts to screen size:
 * - Desktop: Board centered (480-600px), move list on right sidebar
 * - Tablet: Board centered, move list on right or below based on orientation
 * - Mobile: Board full width, move list below
 * 
 * Player panels are positioned directly above/below board
 * Game actions below board on all layouts
 */
export const ResponsiveGameLayout: React.FC<ResponsiveGameLayoutProps> = ({
  boardProps,
  topPlayerProps,
  bottomPlayerProps,
  moves = [],
  gameActionsProps,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const showSideBySide = shouldShowMoveListSideBySide();
  const boardSize = getBoardSize();
  const squareSize = getSquareSize();

  const BoardSection = (
    <View style={styles.boardSection}>
      {/* Top Player (Opponent) */}
      <PlayerPanel {...topPlayerProps} position="top" />

      {/* Chess Board */}
      <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
        <ChessBoard
          {...boardProps}
          size={boardSize}
          squareSize={squareSize}
        />
      </View>

      {/* Bottom Player (Self) */}
      <PlayerPanel {...bottomPlayerProps} position="bottom" />

      {/* Game Actions */}
      {gameActionsProps && (
        <View style={styles.actionsContainer}>
          <GameActions {...gameActionsProps} />
        </View>
      )}
    </View>
  );

  const MoveListSection = (
    <View style={[
      styles.moveListSection,
      showSideBySide ? styles.moveListSidebar : styles.moveListBelow,
    ]}>
      <MoveList moves={moves} />
    </View>
  );

  if (showSideBySide) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.sideBySideLayout}
      >
        <View style={styles.mainContent}>
          {BoardSection}
        </View>
        {MoveListSection}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.stackedLayout}
    >
      {BoardSection}
      {MoveListSection}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sideBySideLayout: {
    flexDirection: 'row',
    padding: Spacing.xl,
    gap: Spacing.xl,
    minHeight: '100%',
    ...Platform.select({
      web: {
        justifyContent: 'center',
      },
    }),
  },
  stackedLayout: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xl,
  },
  mainContent: {
    flex: 1,
    maxWidth: 800,
    alignItems: 'center',
  },
  boardSection: {
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  boardContainer: {
    // Size set dynamically
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 600,
    marginTop: Spacing.md,
  },
  moveListSection: {
    width: '100%',
  },
  moveListSidebar: {
    width: 300,
  },
  scrollContainer: {
    flex: 1,
  },
  sidebar: {
    ...Platform.select({
      web: {
        position: 'sticky' as const,
        top: Spacing.xl,
      },
    }),
  },
  moveListBelow: {
    maxWidth: 600,
  },
});
