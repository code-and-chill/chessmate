/**
 * Settings Card Component
 * features/settings/components/SettingsCard.tsx
 */

import { TouchableOpacity, View } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type SettingsCardProps = {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

export const SettingsCard: React.FC<SettingsCardProps> = ({ icon, title, description, onPress }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  return (
    <Card variant="elevated" size="md" hoverable pressable>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={{ padding: spacingTokens[4], flexDirection: 'row', alignItems: 'center', gap: spacingTokens[4] }}>
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
      </TouchableOpacity>
    </Card>
  );
};
