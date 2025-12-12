/**
 * BoardSection - Molecular Layout Component
 * 
 * Composes atomic components into a reusable board section molecule.
 * Follows atomic design principles.
 * 
 * @packageDocumentation
 */

import React from 'react';
import { VStack } from '@/ui/primitives/Stack';
import { spacingTokens } from '@/ui/tokens/spacing';
import { componentElevation, getElevation } from '@/ui/tokens/elevation';
import type { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import type { BaseAnimationBuilder } from 'react-native-reanimated';

export interface BoardSectionProps {
  /** Board size in pixels */
  boardSize: number;
  /** Flex value for board column */
  boardColumnFlex: number;
  /** Animation config for entrance */
  createAnimConfig?: (delay: number) => BaseAnimationBuilder | undefined;
  /** Render prop for top player section */
  renderTopPlayer?: (props: { width: number }) => React.ReactNode;
  /** Render prop for bottom player section */
  renderBottomPlayer?: (props: { width: number }) => React.ReactNode;
  /** Render prop for game actions (mobile only) */
  renderGameActions?: (props: { layoutType: string }) => React.ReactNode;
  /** Chess board component */
  boardComponent: React.ReactNode;
  /** Whether layout is horizontal */
  isHorizontalLayout: boolean;
  /** Layout type */
  layoutType: string;
  /** Custom style */
  style?: ViewStyle;
}

/**
 * BoardSection Component
 * 
 * Molecular component that composes board, players, and actions.
 * Provides highest elevation (primary focus) for visual hierarchy.
 * 
 * @example
 * ```tsx
 * <BoardSection
 *   boardSize={400}
 *   boardColumnFlex={0.7}
 *   boardComponent={<ChessBoard {...props} />}
 *   renderTopPlayer={({ width }) => <PlayerCard width={width} />}
 * />
 * ```
 */
export const BoardSection: React.FC<BoardSectionProps> = ({
  boardSize,
  boardColumnFlex,
  createAnimConfig,
  renderTopPlayer,
  renderBottomPlayer,
  renderGameActions,
  boardComponent,
  isHorizontalLayout,
  layoutType,
  style,
}) => {
  const boardElevation = getElevation(componentElevation.gameInfo);
  
  const defaultAnimConfig = (delay: number) => createAnimConfig?.(delay);

  return (
    <VStack 
      flex={boardColumnFlex}
      gap={spacingTokens[1]}
      style={{ 
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: boardElevation.zIndex,
        ...style,
      }}
    >
      {/* Top Player */}
      {renderTopPlayer && (
        <Animated.View entering={defaultAnimConfig(0)} style={{ width: boardSize }}>
          {renderTopPlayer({ width: boardSize })}
        </Animated.View>
      )}
      
      {/* Chess Board */}
      <Animated.View 
        entering={defaultAnimConfig(50)} 
        style={{ width: boardSize, height: boardSize }}
      >
        {boardComponent}
      </Animated.View>
      
      {/* Bottom Player */}
      {renderBottomPlayer && (
        <Animated.View entering={defaultAnimConfig(150)} style={{ width: boardSize }}>
          {renderBottomPlayer({ width: boardSize })}
        </Animated.View>
      )}
      
      {/* Game Actions (mobile only - shown below board) */}
      {!isHorizontalLayout && renderGameActions && (
        <Animated.View entering={defaultAnimConfig(200)} style={{ width: boardSize }}>
          {renderGameActions({ layoutType })}
        </Animated.View>
      )}
    </VStack>
  );
};

BoardSection.displayName = 'BoardSection';
