/**
 * Lesson Card Component
 * features/learn/components/LessonCard.tsx
 */

import { TouchableOpacity, View } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type LessonCardProps = {
  title: string;
  completed: boolean;
  time: string;
};

export const LessonCard: React.FC<LessonCardProps> = ({ title, completed, time }) => {
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
          <Text style={{ fontSize: 28 }}>{completed ? '✅' : '⭕'}</Text>
          <View style={{ flex: 1 }}>
            <Text variant="body" color={colors.foreground} style={{ fontWeight: '600', marginBottom: spacingTokens[1] }}>
              {title}
            </Text>
            <Text variant="caption" color={colors.secondary}>
              ⏱️ {time}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};
