'use client';

/**
 * BoardContainer Component - Chess.com Grade
 * app/components/play/BoardContainer.tsx
 * 
 * Wrapper for the professional chess board with responsive sizing and theming
 */

import { View, Platform, Dimensions, StyleSheet } from 'react-native';
import { Card, useColors } from '@/ui';
import { ChessBoard } from '@/features/board';
import type { BoardTheme, ThemeMode } from '@/features/board/config/themeConfig';

const { width: windowWidth } = Dimensions.get('window');

export interface BoardContainerProps {
  fen: string;
  sideToMove: 'w' | 'b';
  myColor: 'w' | 'b';
  isInteractive: boolean;
  onMove: (from: string, to: string) => void;
  orientation?: 'white' | 'black';
  showCoordinates?: boolean;
  lastMove?: { from: string; to: string } | null;
  boardTheme?: BoardTheme;
  themeMode?: ThemeMode;
  showLegalMoves?: boolean;
  animateMovements?: boolean;
}

export const BoardContainer: React.FC<BoardContainerProps> = ({
  fen,
  sideToMove,
  myColor,
  isInteractive,
  onMove,
  orientation = 'white',
  showCoordinates = true,
  lastMove = null,
  boardTheme = 'classic',
  themeMode = 'light',
  showLegalMoves = true,
  animateMovements = true,
}) => {
  const colors = useColors();
  
  // Responsive board sizing - Chess.com style
  const boardSize = Platform.OS === 'web' 
    ? Math.min(
        typeof window !== 'undefined' ? window.innerHeight * 0.7 : 600,
        typeof window !== 'undefined' ? window.innerWidth * 0.45 : 600,
        600
      )
    : Math.min(windowWidth * 0.95, 480);

  return (
    <View style={styles.container}>
      <Card
        padding={2}
        shadow="panel"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background.secondary,
        }}
      >
        <ChessBoard
          fen={fen}
          sideToMove={sideToMove}
          myColor={myColor}
          isInteractive={isInteractive}
          onMove={onMove}
          size={boardSize}
          orientation={orientation}
          showCoordinates={showCoordinates}
          lastMove={lastMove}
          boardTheme={boardTheme}
          themeMode={themeMode}
          showLegalMoves={showLegalMoves}
          animateMovements={animateMovements}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

BoardContainer.displayName = 'BoardContainer';
