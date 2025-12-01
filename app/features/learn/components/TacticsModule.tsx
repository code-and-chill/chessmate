/**
 * Tactics Module Component
 * features/learn/components/TacticsModule.tsx
 */

import { ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Card } from '@/ui/primitives/Card';
import { Button } from '@/ui/primitives/Button';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import { CategoryButton } from './CategoryButton';

export type TacticsModuleProps = {
  onBack: () => void;
};

const TACTICS_CATEGORIES = [
  { icon: '🔱', title: 'Forks', count: 45 },
  { icon: '📌', title: 'Pins', count: 38 },
  { icon: '🎭', title: 'Discovered Attacks', count: 22 },
  { icon: '👑', title: 'Back Rank Mates', count: 31 },
  { icon: '⚔️', title: 'Deflection', count: 18 },
];

export const TacticsModule: React.FC<TacticsModuleProps> = ({ onBack }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
    accent: getColor(colorTokens.blue[600], isDark),
    success: getColor(colorTokens.green[600], isDark),
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <VStack style={{ padding: spacingTokens[6] }} gap={6}>
        <TouchableOpacity
          style={{ paddingVertical: spacingTokens[2], alignSelf: 'flex-start' }}
          onPress={onBack}
        >
          <Text variant="body" color={colors.accent}>
            ← Back
          </Text>
        </TouchableOpacity>

        <VStack gap={2}>
          <Text variant="heading" color={colors.foreground}>
            Tactics Trainer
          </Text>
          <Text variant="body" color={colors.secondary}>
            Rating: 1450 • Solved: 234
          </Text>
        </VStack>

        <Card variant="default" size="md">
          <VStack gap={2} style={{ padding: spacingTokens[6], alignItems: 'center' }}>
            <Text variant="caption" color={colors.secondary}>
              Your Tactics Rating
            </Text>
            <Text variant="heading" color={colors.accent} style={{ fontSize: 48 }}>
              1450
            </Text>
            <Text variant="caption" color={colors.success} style={{ fontWeight: '600' }}>
              +15 this week
            </Text>
          </VStack>
        </Card>

        <Button
          variant="solid"
          size="lg"
          onPress={() => router.push('/(tabs)/explore')}
        >
          Start Training Session
        </Button>

        <VStack gap={2} style={{ marginTop: spacingTokens[4] }}>
          <Text variant="title" color={colors.foreground}>
            Categories
          </Text>
          {TACTICS_CATEGORIES.map((cat, idx) => (
            <CategoryButton
              key={idx}
              icon={cat.icon}
              title={cat.title}
              count={cat.count}
            />
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
};
