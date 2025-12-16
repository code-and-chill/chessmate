import React from 'react';
import Animated, { Layout } from 'react-native-reanimated';
import { Panel } from '@/ui/primitives/Panel';
import { Card } from '@/ui/primitives/Card';
import { MoveList } from '@/features/game';
import { useBoardLayout } from '@/features/board/hooks/useBoardLayout';

export interface MovesColumnProps {
  isDesktop?: boolean;
  moves: any[];
  anim: any;
  style?: any;
  flex?: number;
}

export function MovesColumn({ isDesktop, moves, anim, style, flex }: MovesColumnProps) {
  const layout = useBoardLayout();
  const isDesktopFinal = typeof isDesktop !== 'undefined' ? isDesktop : layout.isDesktopLayout;

  const containerStyle = Array.isArray(style) ? Object.assign({}, ...style) : style || {};
  if (typeof flex === 'number') containerStyle.flex = flex;

  return (
    <Animated.View entering={anim} layout={Layout.springify()} style={containerStyle}>
      {isDesktopFinal ? (
        <Panel variant="glass" padding={0} style={{ flex: 1, overflow: 'hidden' }}>
          <MoveList moves={moves} />
        </Panel>
      ) : (
        <Card variant="glass" size="md" padding={0} style={{ flex: 1 }}>
          <MoveList moves={moves} />
        </Card>
      )}
    </Animated.View>
  );
}
