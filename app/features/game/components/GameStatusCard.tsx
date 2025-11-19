/**
 * GameStatusCard Component
 * app/features/game/components/GameStatusCard.tsx
 * 
 * Shows current game progress and turn
 */

import type React from 'react';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';

export interface GameStatusCardProps {
  currentTurn: 'w' | 'b';
  moveCount: number;
  status?: string;
}

export const GameStatusCard: React.FC<GameStatusCardProps> = ({
  currentTurn,
  moveCount,
  status,
}) => {
  const { colors } = useThemeTokens();
  const turnLabel = currentTurn === 'w' ? 'White' : 'Black';

  return (
    <Card variant="default" size="md" padding={16}>
      <VStack gap={spacingTokens[2]}>
        <Text variant="subheading" weight="semibold" style={{ fontSize: 16 }}>
          Game Status
        </Text>
        
        <HStack justifyContent="space-between" alignItems="center">
          <VStack gap={spacingTokens[1]}>
            <Text variant="caption" color={colors.foreground.muted} style={{ fontSize: 12 }}>
              Current Turn
            </Text>
            <Text variant="body" weight="semibold" color={colors.foreground.primary} style={{ fontSize: 14 }}>
              {turnLabel} to Move
            </Text>
          </VStack>
          
          <VStack gap={spacingTokens[1]} alignItems="flex-end">
            <Text variant="caption" color={colors.foreground.muted} style={{ fontSize: 12 }}>
              Moves Made
            </Text>
            <Text variant="body" weight="semibold" color={colors.foreground.primary} style={{ fontSize: 14 }}>
              {moveCount}
            </Text>
          </VStack>
        </HStack>

        {status && (
          <Text variant="body" color={colors.foreground.secondary} style={{ fontSize: 14, marginTop: spacingTokens[1] }}>
            {status}
          </Text>
        )}
      </VStack>
    </Card>
  );
};

GameStatusCard.displayName = 'GameStatusCard';
