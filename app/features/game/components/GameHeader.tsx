/**
 * GameHeader Component
 * app/features/game/components/GameHeader.tsx
 * 
 * Clean header showing game title and metadata in hierarchical format
 */

import React from 'react';
import { HStack, VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Panel } from '@/ui/primitives/Panel';
import { StatusBadge } from '@/ui/components/StatusBadge';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';

export interface GameHeaderProps {
  title?: string;
  status: 'live' | 'ended' | 'paused' | 'waiting';
  gameMode?: string;
  timeControl?: string;
  isRated?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  status,
  gameMode = 'Blitz',
  timeControl = '10+0',
  isRated = true,
}) => {
  const { colors } = useThemeTokens();

  return (
    <Panel variant="glass" padding={spacingTokens[3]}>
      <VStack gap={spacingTokens[3]}>
        {/* Metadata Line */}
        <HStack gap={spacingTokens[2]} alignItems="center">
        <StatusBadge status={status} size="sm" />
        <Text 
          variant="label" 
          style={{ 
            fontSize: 14, 
            fontWeight: '600',
            color: isRated ? colors.accent.primary : colors.foreground.secondary 
          }}
        >
          {isRated ? '⭐ Rated' : '🎮 Casual'}
        </Text>
        <Text variant="body" color={colors.foreground.secondary} style={{ fontSize: 14 }}>
          {gameMode}
        </Text>
        <Text variant="body" color={colors.foreground.muted} style={{ fontSize: 14 }}>
          •
        </Text>
        <Text variant="body" color={colors.foreground.muted} style={{ fontSize: 14 }}>
          {timeControl}
        </Text>
      </HStack>
    </VStack>
    </Panel>
  );
};

GameHeader.displayName = 'GameHeader';
