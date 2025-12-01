/**
 * Stats Row Component
 * features/learn/components/StatsRow.tsx
 */

import { View } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type StatsRowProps = {
  streak: number;
  tacticsRating: number;
};

export const StatsRow: React.FC<StatsRowProps> = ({ streak, tacticsRating }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  return (
    <View style={{ flexDirection: 'row', gap: spacingTokens[3] }}>
      <Card variant="default" size="sm" style={{ flex: 1 }}>
        <VStack gap={1} style={{ padding: spacingTokens[4], alignItems: 'center' }}>
          <Text variant="title" color={colors.foreground}>
            🔥 {streak}
          </Text>
          <Text variant="caption" color={colors.secondary}>
            Day Streak
          </Text>
        </VStack>
      </Card>

      <Card variant="default" size="sm" style={{ flex: 1 }}>
        <VStack gap={1} style={{ padding: spacingTokens[4], alignItems: 'center' }}>
          <Text variant="title" color={colors.foreground}>
            ⚡ {tacticsRating}
          </Text>
          <Text variant="caption" color={colors.secondary}>
            Tactics Rating
          </Text>
        </VStack>
      </Card>
    </View>
  );
};
