/**
 * Game Review Card Component
 * features/learn/components/GameReviewCard.tsx
 */

import { TouchableOpacity, View } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type GameReviewCardProps = {
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  accuracy: number;
  blunders: number;
  mistakes: number;
};

export const GameReviewCard: React.FC<GameReviewCardProps> = ({
  opponent,
  result,
  accuracy,
  blunders,
  mistakes,
}) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
    success: getColor(colorTokens.green[600], isDark),
    error: getColor(colorTokens.red[600], isDark),
    warning: getColor(colorTokens.amber[600], isDark),
  };

  const resultColor = result === 'win' ? colors.success : result === 'loss' ? colors.error : colors.warning;
  const resultText = result === 'win' ? '🏆 Win' : result === 'loss' ? '❌ Loss' : '🤝 Draw';

  return (
    <Card variant="elevated" size="md" hoverable pressable>
      <TouchableOpacity activeOpacity={0.9}>
        <View style={{ padding: spacingTokens[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacingTokens[3] }}>
            <Text variant="title" color={colors.foreground}>
              vs {opponent}
            </Text>
            <Text variant="body" color={resultColor} style={{ fontWeight: '600' }}>
              {resultText}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="caption" color={colors.secondary} style={{ marginBottom: spacingTokens[1] }}>
                Accuracy
              </Text>
              <Text variant="title" color={colors.foreground}>
                {accuracy}%
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="caption" color={colors.secondary} style={{ marginBottom: spacingTokens[1] }}>
                Blunders
              </Text>
              <Text variant="title" color={colors.foreground}>
                {blunders}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="caption" color={colors.secondary} style={{ marginBottom: spacingTokens[1] }}>
                Mistakes
              </Text>
              <Text variant="title" color={colors.foreground}>
                {mistakes}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};
