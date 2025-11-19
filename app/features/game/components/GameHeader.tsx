/**
 * GameHeader Component
 * app/features/game/components/GameHeader.tsx
 * 
 * Clean header showing game title and metadata in hierarchical format
 */

import React from 'react';
import { HStack, VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
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
    <VStack gap={spacingTokens[3]}>
      {/* Metadata Line */}
      <HStack gap={spacingTokens[2]} alignItems="center">
        <StatusBadge status={status} size="sm" />
        <Text variant="label" color={colors.foreground.secondary} style={{ fontSize: 14 }}>
          {isRated ? 'Rated' : 'Casual'} {gameMode}
        </Text>
        <Text variant="body" color={colors.foreground.muted} style={{ fontSize: 14 }}>
          •
        </Text>
        <Text variant="body" color={colors.foreground.muted} style={{ fontSize: 14 }}>
          {timeControl}
        </Text>
      </HStack>
    </VStack>
  );
};

GameHeader.displayName = 'GameHeader';
