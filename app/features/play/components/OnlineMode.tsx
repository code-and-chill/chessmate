/**
 * Online Mode Component
 * features/play/components/OnlineMode.tsx
 */

import { SafeAreaView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Button } from '@/ui/primitives/Button';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import type { TimeControl } from '../types/play.types';

export type OnlineModeProps = {
  timeControl: TimeControl;
  onChangeTimeControl: (tc: TimeControl) => void;
  onBack: () => void;
  onStartGame: (tc: TimeControl) => void;
};

const TIME_CONTROLS: Array<{ value: TimeControl; label: string }> = [
  { value: '3+0', label: '⚡ Blitz 3 min' },
  { value: '10+0', label: '⏱️ Rapid 10 min' },
  { value: '15+10', label: '⏱️ Rapid 15|10' },
  { value: '30+0', label: '🐢 Classical 30 min' },
];

export const OnlineMode: React.FC<OnlineModeProps> = ({
  timeControl,
  onChangeTimeControl,
  onBack,
  onStartGame,
}) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
    accent: getColor(colorTokens.blue[600], isDark),
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <VStack style={{ padding: spacingTokens[6] }} gap={6}>
        <TouchableOpacity
          style={{ paddingVertical: spacingTokens[2], paddingHorizontal: spacingTokens[3], alignSelf: 'flex-start' }}
          onPress={onBack}
        >
          <Text variant="body" color={colors.accent}>
            ← Back
          </Text>
        </TouchableOpacity>

        <VStack gap={2} style={{ alignItems: 'center' }}>
          <Text variant="heading" color={colors.foreground}>
            Online Play
          </Text>
          <Text variant="body" color={colors.secondary}>
            Choose your game speed
          </Text>
        </VStack>

        <VStack gap={3} style={{ marginTop: spacingTokens[4] }}>
          {TIME_CONTROLS.map((tc, idx) => (
            <Animated.View
              key={tc.value}
              entering={FadeInDown.delay(idx * 100).duration(400).springify()}
            >
              <Card
                variant={timeControl === tc.value ? 'gradient' : 'default'}
                size="md"
                hoverable
                pressable
                animated
              >
                <TouchableOpacity
                  style={{
                    padding: spacingTokens[4],
                  }}
                  onPress={() => onChangeTimeControl(tc.value)}
                  activeOpacity={0.9}
                >
                  <Text
                    variant="title"
                    color={timeControl === tc.value ? '#FFFFFF' : colors.foreground}
                  >
                    {tc.label}
                  </Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>
          ))}
        </VStack>

        <Animated.View entering={FadeInUp.delay(500).duration(400).springify()}>
          <Button
            variant="solid"
            size="lg"
            onPress={() => onStartGame(timeControl)}
          >
            Find Match
          </Button>
        </Animated.View>
      </VStack>
    </SafeAreaView>
  );
};
