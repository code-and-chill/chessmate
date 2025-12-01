/**
 * Opening Card Component
 * features/learn/components/OpeningCard.tsx
 */

import { TouchableOpacity, View } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type OpeningCardProps = {
  name: string;
  eco: string;
  games: number;
  winRate: number;
};

export const OpeningCard: React.FC<OpeningCardProps> = ({ name, eco, games, winRate }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
    accent: getColor(colorTokens.blue[600], isDark),
    success: getColor(colorTokens.green[600], isDark),
    warning: getColor(colorTokens.amber[600], isDark),
  };

  const winRateColor = winRate >= 55 ? colors.success : colors.warning;

  return (
    <Card variant="default" size="sm" hoverable pressable>
      <TouchableOpacity activeOpacity={0.9}>
        <View style={{ padding: spacingTokens[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacingTokens[2] }}>
            <Text variant="body" color={colors.foreground} style={{ fontWeight: '600' }}>
              {name}
            </Text>
            <Text variant="body" color={colors.accent} style={{ fontWeight: '600' }}>
              {eco}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacingTokens[4] }}>
            <Text variant="caption" color={colors.secondary}>
              📊 {games} games
            </Text>
            <Text variant="caption" color={winRateColor}>
              {winRate}% win rate
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};
