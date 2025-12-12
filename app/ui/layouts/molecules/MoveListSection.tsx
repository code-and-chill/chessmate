/**
 * MoveListSection - Molecular Layout Component
 * 
 * Composes atomic components into a reusable move list section molecule.
 * Follows atomic design principles.
 * 
 * @packageDocumentation
 */

import React from 'react';
import { Card } from '@/ui/primitives/Card';
import { Panel } from '@/ui/primitives/Panel';
import { MoveList, type Move } from '@/features/game';
import { componentElevation, getElevation } from '@/ui/tokens/elevation';
import type { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import type { BaseAnimationBuilder } from 'react-native-reanimated';
import type { LayoutType } from '@/ui/tokens/breakpoints';

export interface MoveListSectionProps {
  /** Moves to display */
  moves: Move[];
  /** Layout type */
  layoutType: LayoutType;
  /** Flex value for moves column */
  movesColumnFlex: number;
  /** Whether layout is horizontal */
  isHorizontalLayout: boolean;
  /** Animation config for entrance */
  createAnimConfig?: (delay: number) => BaseAnimationBuilder | undefined;
  /** Custom render function (overrides default) */
  renderMoveList?: (props: { layoutType: LayoutType; moves: Move[] }) => React.ReactNode;
  /** Custom style */
  style?: ViewStyle;
}

/**
 * MoveListSection Component
 * 
 * Molecular component that displays move list with appropriate container.
 * Provides medium elevation (secondary focus) for visual hierarchy.
 * 
 * @example
 * ```tsx
 * <MoveListSection
 *   moves={gameMoves}
 *   layoutType="desktop"
 *   movesColumnFlex={0.3}
 *   isHorizontalLayout
 * />
 * ```
 */
export const MoveListSection: React.FC<MoveListSectionProps> = ({
  moves,
  layoutType,
  movesColumnFlex,
  isHorizontalLayout,
  createAnimConfig,
  renderMoveList,
  style,
}) => {
  const moveListElevation = getElevation(componentElevation.moveList);
  const defaultAnimConfig = (delay: number) => createAnimConfig?.(delay);

  // Default move list renderer with visual hierarchy (medium elevation)
  const defaultRenderMoveList = (lt: LayoutType, m: Move[]) => {
    if (lt === 'desktop') {
      return (
        <Panel 
          variant="glass" 
          padding={0} 
          style={{ 
            flex: 1, 
            overflow: 'hidden',
            zIndex: moveListElevation.zIndex,
          }}
        >
          <MoveList moves={m} />
        </Panel>
      );
    }
    return (
      <Card 
        variant="default" 
        size="md" 
        padding={0} 
        style={{ 
          flex: 1,
          zIndex: moveListElevation.zIndex,
        }}
      >
        <MoveList moves={m} />
      </Card>
    );
  };

  return (
    <Animated.View 
      entering={defaultAnimConfig(100)} 
      style={{ 
        flex: movesColumnFlex,
        minHeight: isHorizontalLayout ? 0 : 200,
        maxHeight: isHorizontalLayout ? undefined : 300,
        alignSelf: 'stretch',
        ...style,
      }}
    >
      {(renderMoveList || defaultRenderMoveList)(layoutType, moves)}
    </Animated.View>
  );
};

MoveListSection.displayName = 'MoveListSection';
