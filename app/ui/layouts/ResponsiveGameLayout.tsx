import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import type { ViewStyle, LayoutChangeEvent } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChessBoard, type ChessBoardProps } from '@/features/board';
import { MoveList, type Move } from '@/features/game';
import { Box } from '@/ui/primitives/Box';
import { VStack } from '@/ui/primitives/Stack';
import { Card } from '@/ui/primitives/Card';
import { Panel } from '@/ui/primitives/Panel';
import { Surface } from '@/ui/primitives/Surface';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { useDeviceType } from '@/ui/hooks/useResponsive';
import { spacingTokens } from '@/ui/tokens/spacing';
import { LayoutBreakpoints } from '@/core/constants/layout';

/**
 * Layout type for responsive behavior
 * - mobile: < 768px - vertical stacked layout
 * - tablet: 768px - 1023px - horizontal layout with smaller board
 * - desktop: >= 1024px - horizontal layout with larger board and glassmorphic panel
 */
export type LayoutType = 'mobile' | 'tablet' | 'desktop';

/**
 * Board size configuration for different layouts
 */
export interface BoardSizeConfig {
  boardSize: number;
  squareSize: number;
}

/**
 * Props for the top and bottom player sections
 * Using render props pattern for flexibility
 */
export interface PlayerSectionProps {
  width: number;
}

/**
 * Props for the game actions section
 * Using render props pattern for flexibility
 */
export interface GameActionsSectionProps {
  layoutType: LayoutType;
}

/**
 * Props for the move list section
 * Using render props pattern for flexibility
 */
export interface MoveListSectionProps {
  layoutType: LayoutType;
  moves: Move[];
}

export interface ResponsiveGameLayoutProps {
  /** Chess board props (size and squareSize are calculated internally) */
  boardProps: Omit<ChessBoardProps, 'size' | 'squareSize'>;
  
  /** Moves to display in the move list */
  moves?: Move[];
  
  /** Render prop for top player section */
  renderTopPlayer?: (props: PlayerSectionProps) => React.ReactNode;
  
  /** Render prop for bottom player section */
  renderBottomPlayer?: (props: PlayerSectionProps) => React.ReactNode;
  
  /** Render prop for game actions section */
  renderGameActions?: (props: GameActionsSectionProps) => React.ReactNode;
  
  /** Render prop for move list section (overrides default) */
  renderMoveList?: (props: MoveListSectionProps) => React.ReactNode;
  
  /** Render prop for header section */
  renderHeader?: () => React.ReactNode;
  
  /** Whether to animate entrance */
  animated?: boolean;
  
  /** Custom style for the container */
  style?: ViewStyle;
  
  /** Test ID for testing */
  testID?: string;
}

/**
 * Calculate board size based on layout type and available dimensions
 * 
 * @param layoutType - Current layout type
 * @param contentWidth - Available content width (already accounts for sidebar, padding, etc.)
 * @param contentHeight - Available content height
 * @returns Board size configuration
 */
export const calculateBoardSize = (
  layoutType: LayoutType,
  contentWidth: number,
  contentHeight: number
): BoardSizeConfig => {
  const HEADER_HEIGHT = 70;
  const VERTICAL_PADDING = spacingTokens[4] * 2;
  const HORIZONTAL_PADDING = spacingTokens[2] * 2;
  const PLAYER_CARD_HEIGHT = 56;
  const PLAYER_CARDS_TOTAL = PLAYER_CARD_HEIGHT * 2;
  const GAP_HEIGHT = spacingTokens[1] * 4;
  const BREATHING_ROOM = 24;
  
  const availableHeight = contentHeight - HEADER_HEIGHT - VERTICAL_PADDING - BREATHING_ROOM;
  const availableWidth = contentWidth - HORIZONTAL_PADDING;
  
  let boardSize: number;
  
  switch (layoutType) {
    case 'desktop': {
      const boardColumnWidth = (availableWidth * 0.6) - spacingTokens[4];
      const maxBoardHeight = availableHeight - PLAYER_CARDS_TOTAL - GAP_HEIGHT;
      boardSize = Math.min(boardColumnWidth, maxBoardHeight);
      break;
    }
    case 'tablet': {
      const boardColumnWidth = (availableWidth * 0.55) - spacingTokens[4];
      const maxBoardHeight = availableHeight - PLAYER_CARDS_TOTAL - GAP_HEIGHT;
      boardSize = Math.min(boardColumnWidth, maxBoardHeight, 480);
      break;
    }
    case 'mobile':
    default: {
      boardSize = Math.min(availableWidth, 500);
      break;
    }
  }
  
  return {
    boardSize: Math.max(boardSize, 280),
    squareSize: Math.max(boardSize, 280) / 8,
  };
};

/**
 * Get layout type based on screen width
 * 
 * @param width - Screen width
 * @returns Layout type
 */
export const getLayoutType = (width: number): LayoutType => {
  if (width >= LayoutBreakpoints.desktop) {
    return 'desktop';
  }
  if (width >= LayoutBreakpoints.tablet) {
    return 'tablet';
  }
  return 'mobile';
};

/**
 * ResponsiveGameLayout Component
 * 
 * A state-of-the-art responsive layout for chess games that adapts seamlessly
 * across iOS, Android, and Web platforms.
 * 
 * Layout behavior:
 * - Desktop (≥1024px): Horizontal layout with board (60%) and glassmorphic move list panel (40%)
 * - Tablet (768-1023px): Horizontal layout with board (55%) and move list card (45%)
 * - Mobile (<768px): Vertical stacked layout with full-width board and move list below
 * 
 * Features:
 * - Uses DLS primitives (Box, VStack, HStack, Card, Panel, Surface)
 * - Three-tier responsive system aligned with breakpoints.ts and layout.ts
 * - Render props pattern for flexible customization
 * - Animated entrance with react-native-reanimated
 * - Theme-aware styling via useThemeTokens
 * 
 * @example
 * ```tsx
 * <ResponsiveGameLayout
 *   boardProps={{ fen, sideToMove, onMove }}
 *   moves={formattedMoves}
 *   renderTopPlayer={({ width }) => <PlayerCard width={width} ... />}
 *   renderBottomPlayer={({ width }) => <PlayerCard width={width} ... />}
 *   renderGameActions={({ layoutType }) => <GameActions ... />}
 *   animated
 * />
 * ```
 */
export const ResponsiveGameLayout: React.FC<ResponsiveGameLayoutProps> = ({
  boardProps,
  moves = [],
  renderTopPlayer,
  renderBottomPlayer,
  renderGameActions,
  renderMoveList,
  renderHeader,
  animated = true,
  style,
  testID,
}) => {
  const { colors } = useThemeTokens();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  
  // Track measured content dimensions for accurate sizing
  const [contentDimensions, setContentDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Handle layout measurement to get actual content area dimensions
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout;
    // Only update if dimensions changed significantly (avoid unnecessary re-renders)
    if (
      !contentDimensions ||
      Math.abs(measuredWidth - contentDimensions.width) > 1 ||
      Math.abs(measuredHeight - contentDimensions.height) > 1
    ) {
      setContentDimensions({ width: measuredWidth, height: measuredHeight });
    }
  };
  
  // Use measured content dimensions, fall back to window dimensions on first render
  const effectiveWidth = contentDimensions?.width ?? windowWidth;
  const effectiveHeight = contentDimensions?.height ?? windowHeight;
  
  // Determine layout type based on content width (not viewport width)
  const layoutType = getLayoutType(effectiveWidth);
  const isHorizontalLayout = layoutType !== 'mobile';
  
  // Calculate board size based on measured content dimensions
  const { boardSize, squareSize } = calculateBoardSize(layoutType, effectiveWidth, effectiveHeight);
  
  // Animation configuration
  const createAnimConfig = (delay: number) => 
    animated ? FadeInUp.duration(250).delay(delay) : undefined;
  
  // Default move list renderer
  const defaultRenderMoveList = ({ layoutType: lt, moves: m }: MoveListSectionProps) => {
    if (lt === 'desktop') {
      return (
        <Panel variant="glass" padding={0} style={{ flex: 1, overflow: 'hidden' }}>
          <MoveList moves={m} />
        </Panel>
      );
    }
    return (
      <Card variant="default" size="md" padding={0} style={{ flex: 1 }}>
        <MoveList moves={m} />
      </Card>
    );
  };
  
  // Board section with players
  const BoardSection = (
    <VStack 
      flex={isHorizontalLayout ? (layoutType === 'desktop' ? 0.6 : 0.55) : 1}
      gap={spacingTokens[1]}
      style={{ 
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Top Player */}
      {renderTopPlayer && (
        <Animated.View entering={createAnimConfig(0)} style={{ width: boardSize }}>
          {renderTopPlayer({ width: boardSize })}
        </Animated.View>
      )}
      
      {/* Chess Board */}
      <Animated.View 
        entering={createAnimConfig(50)} 
        style={{ width: boardSize, height: boardSize }}
      >
        <ChessBoard
          {...boardProps}
          size={boardSize}
          squareSize={squareSize}
        />
      </Animated.View>
      
      {/* Bottom Player */}
      {renderBottomPlayer && (
        <Animated.View entering={createAnimConfig(150)} style={{ width: boardSize }}>
          {renderBottomPlayer({ width: boardSize })}
        </Animated.View>
      )}
      
      {/* Game Actions (mobile only - shown below board) */}
      {!isHorizontalLayout && renderGameActions && (
        <Animated.View entering={createAnimConfig(200)} style={{ width: boardSize }}>
          {renderGameActions({ layoutType })}
        </Animated.View>
      )}
    </VStack>
  );
  
  // Move list section
  const MoveListSection = (
    <Animated.View 
      entering={createAnimConfig(100)} 
      style={{ 
        flex: isHorizontalLayout ? (layoutType === 'desktop' ? 0.4 : 0.45) : 0,
        minHeight: isHorizontalLayout ? 0 : 300,
        maxHeight: isHorizontalLayout ? undefined : 400,
        alignSelf: 'stretch',
      }}
    >
      {(renderMoveList || defaultRenderMoveList)({ layoutType, moves })}
    </Animated.View>
  );
  
  // Main content layout
  const MainContent = (
    <Box 
      style={{ 
        flexDirection: isHorizontalLayout ? 'row' : 'column', 
        flex: 1, 
        gap: spacingTokens[4],
        alignItems: 'stretch',
      }}
    >
      {BoardSection}
      {MoveListSection}
    </Box>
  );
  
  // Merge styles properly for Surface component
  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };
  
  return (
    <Surface variant="subtle" style={containerStyle}>
      <Box 
        flex={1} 
        style={{ paddingHorizontal: spacingTokens[2], paddingTop: spacingTokens[4] }}
        onLayout={handleLayout}
      >
        <VStack flex={1} gap={spacingTokens[4]}>
          {/* Header Section */}
          {renderHeader && renderHeader()}
          
          {/* Main Game Area */}
          {MainContent}
        </VStack>
      </Box>
    </Surface>
  );
};
