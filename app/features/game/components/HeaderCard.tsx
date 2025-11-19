/**
 * HeaderCard Component
 * app/features/game/components/HeaderCard.tsx
 * 
 * Clean, hierarchical header showing game metadata
 */

import { Card } from '@/ui/primitives/Card';
import { HStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { StatusBadge } from '@/ui/components/StatusBadge';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';

interface HeaderCardProps {
  status: 'live' | 'ended' | 'paused' | 'waiting';
  gameMode: string;
  timeControl: string;
  isRated?: boolean;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  status,
  gameMode,
  timeControl,
  isRated = true,
}) => {
  const { colors } = useThemeTokens();

  return (
    <Card variant="elevated" size="md" padding={16}>
      <HStack gap={spacingTokens[2]} alignItems="center">
        <StatusBadge status={status} size="sm" />
        <Text variant="body" color={colors.foreground.secondary} style={{ fontSize: 14 }}>
          {isRated ? 'Rated' : 'Casual'} {gameMode}
        </Text>
        <Text variant="body" color={colors.foreground.muted} style={{ fontSize: 14 }}>
          •
        </Text>
        <Text variant="body" color={colors.foreground.muted} style={{ fontSize: 14 }}>
          {timeControl}
        </Text>
      </HStack>
    </Card>
  );
};

HeaderCard.displayName = 'HeaderCard';
