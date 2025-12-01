/**
 * Openings Module Component
 * features/learn/components/OpeningsModule.tsx
 */

import { ScrollView, TouchableOpacity } from 'react-native';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Button } from '@/ui/primitives/Button';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import { OpeningCard } from './OpeningCard';

export type OpeningsModuleProps = {
  onBack: () => void;
};

const REPERTOIRE = [
  { name: 'Italian Game', eco: 'C50', games: 28, winRate: 64 },
  { name: 'Sicilian Defense', eco: 'B20', games: 42, winRate: 58 },
  { name: "Queen's Gambit", eco: 'D06', games: 19, winRate: 71 },
];

export const OpeningsModule: React.FC<OpeningsModuleProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
    accent: getColor(colorTokens.blue[600], isDark),
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
            Openings Explorer
          </Text>
          <Text variant="body" color={colors.secondary}>
            Build your opening repertoire
          </Text>
        </VStack>

        <VStack gap={2}>
          <Text variant="title" color={colors.foreground}>
            Your Repertoire
          </Text>
          {REPERTOIRE.map((opening, idx) => (
            <OpeningCard
              key={idx}
              name={opening.name}
              eco={opening.eco}
              games={opening.games}
              winRate={opening.winRate}
            />
          ))}
        </VStack>

        <Button variant="outline" size="md">
          + Add Opening
        </Button>
      </VStack>
    </ScrollView>
  );
};
