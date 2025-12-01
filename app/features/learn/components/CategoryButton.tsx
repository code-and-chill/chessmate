/**
 * Category Button Component
 * features/learn/components/CategoryButton.tsx
 */

import { TouchableOpacity, View } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type CategoryButtonProps = {
  icon: string;
  title: string;
  count: number;
};

export const CategoryButton: React.FC<CategoryButtonProps> = ({ icon, title, count }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  return (
    <Card variant="default" size="sm" hoverable pressable>
      <TouchableOpacity activeOpacity={0.9}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacingTokens[3], padding: spacingTokens[4] }}>
          <Text style={{ fontSize: 24 }}>{icon}</Text>
          <Text variant="body" color={colors.foreground} style={{ flex: 1, fontWeight: '600' }}>
            {title}
          </Text>
          <Text variant="caption" color={colors.secondary}>
            {count} puzzles
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
};
