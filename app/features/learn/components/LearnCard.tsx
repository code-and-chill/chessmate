/**
 * Learn Card Component
 * features/learn/components/LearnCard.tsx
 */

import { TouchableOpacity, View } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type LearnCardProps = {
  icon: string;
  title: string;
  description: string;
  progress: string;
  onPress: () => void;
};

export const LearnCard: React.FC<LearnCardProps> = ({ icon, title, description, progress, onPress }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
    accent: getColor(colorTokens.blue[600], isDark),
  };

  return (
    <Card variant="elevated" size="md" hoverable pressable>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={{ padding: spacingTokens[4] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacingTokens[4], marginBottom: spacingTokens[2] }}>
            <Text style={{ fontSize: 36 }}>{icon}</Text>
            <VStack gap={1} style={{ flex: 1 }}>
              <Text variant="title" color={colors.foreground}>
                {title}
              </Text>
              <Text variant="caption" color={colors.secondary}>
                {description}
              </Text>
            </VStack>
          </View>
          <Text variant="caption" color={colors.accent} style={{ fontWeight: '600' }}>
            {progress}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
};
