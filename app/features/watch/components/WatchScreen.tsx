/**
 * Watch Feature - Screen Component
 * features/watch/components/WatchScreen.tsx
 */

import { SafeAreaView, Linking, TouchableOpacity } from 'react-native';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type WatchScreenProps = Record<string, never>;

export const WatchScreen: React.FC<WatchScreenProps> = () => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <VStack style={{ padding: spacingTokens[6] }} gap={6}>
        <VStack gap={2}>
          <Text variant="heading" color={colors.foreground}>
            Watch & Streams
          </Text>
          <Text variant="body" color={colors.secondary}>
            Live games and streams coming soon
          </Text>
        </VStack>

        <Card variant="default" size="md">
          <VStack gap={4} style={{ padding: spacingTokens[4] }}>
            <Button
              variant="solid"
              size="md"
              onPress={() => Linking.openURL('https://www.chess.com/tv')}
            >
              Open ChessTV
            </Button>
          </VStack>
        </Card>
      </VStack>
    </SafeAreaView>
  );
};
