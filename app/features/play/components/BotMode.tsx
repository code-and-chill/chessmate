/**
 * Bot Mode Component
 * features/play/components/BotMode.tsx
 */

import { SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type BotModeProps = {
  onBack: () => void;
  onStartGame: (botLevel: string) => void;
};

const BOT_LEVELS = [
  { id: 'beginner', name: 'Beginner Bot', rating: 800, icon: '🟢' },
  { id: 'intermediate', name: 'Intermediate Bot', rating: 1200, icon: '🟡' },
  { id: 'advanced', name: 'Advanced Bot', rating: 1600, icon: '🟠' },
  { id: 'expert', name: 'Expert Bot', rating: 2000, icon: '🔴' },
  { id: 'master', name: 'Master Bot', rating: 2400, icon: '🏆' },
];

export const BotMode: React.FC<BotModeProps> = ({ onBack, onStartGame }) => {
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
      <ScrollView contentContainerStyle={{ padding: spacingTokens[6] }}>
        <VStack gap={6}>
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
              Play vs Bot
            </Text>
            <Text variant="body" color={colors.secondary}>
              Choose your opponent's strength
            </Text>
          </VStack>

          <VStack gap={3} style={{ marginTop: spacingTokens[4] }}>
            {BOT_LEVELS.map((bot, idx) => (
              <Animated.View
                key={bot.id}
                entering={FadeInDown.delay(idx * 100).duration(400).springify()}
              >
                <Card variant="elevated" size="md" hoverable pressable>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacingTokens[4],
                      padding: spacingTokens[4],
                    }}
                    onPress={() => onStartGame(bot.id)}
                    activeOpacity={0.9}
                  >
                    <Text style={{ fontSize: 32 }}>{bot.icon}</Text>
                    <VStack gap={1} style={{ flex: 1 }}>
                      <Text variant="title" color={colors.foreground}>
                        {bot.name}
                      </Text>
                      <Text variant="caption" color={colors.secondary}>
                        Rating: {bot.rating}
                      </Text>
                    </VStack>
                  </TouchableOpacity>
                </Card>
              </Animated.View>
            ))}
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};
