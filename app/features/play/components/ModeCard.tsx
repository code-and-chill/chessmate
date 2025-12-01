/**
 * Mode Card Component
 * features/play/components/ModeCard.tsx
 */

import { TouchableOpacity } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type ModeCardProps = {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

export const ModeCard: React.FC<ModeCardProps> = ({ icon, title, description, onPress }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  return (
    <Card variant="elevated" size="lg" hoverable pressable>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacingTokens[4],
        }}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Text style={{ fontSize: 36 }}>{icon}</Text>
        <VStack gap={1}>
          <Text variant="title" color={colors.foreground}>
            {title}
          </Text>
          <Text variant="body" color={colors.secondary}>
            {description}
          </Text>
        </VStack>
      </TouchableOpacity>
    </Card>
  );
};
