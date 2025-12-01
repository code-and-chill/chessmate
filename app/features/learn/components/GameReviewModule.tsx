/**
 * Game Review Module Component
 * features/learn/components/GameReviewModule.tsx
 */

import { ScrollView, TouchableOpacity } from 'react-native';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import { GameReviewCard } from './GameReviewCard';

export type GameReviewModuleProps = {
  onBack: () => void;
};

const RECENT_GAMES = [
  { opponent: 'Magnus2024', result: 'win' as const, accuracy: 87, blunders: 1, mistakes: 2 },
  { opponent: 'Stockfish_Easy', result: 'loss' as const, accuracy: 72, blunders: 3, mistakes: 4 },
  { opponent: 'ChessGuru99', result: 'draw' as const, accuracy: 81, blunders: 0, mistakes: 3 },
];

export const GameReviewModule: React.FC<GameReviewModuleProps> = ({ onBack }) => {
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
            Game Review
          </Text>
          <Text variant="body" color={colors.secondary}>
            Analyze your recent games
          </Text>
        </VStack>

        <VStack gap={4}>
          {RECENT_GAMES.map((game, idx) => (
            <GameReviewCard
              key={idx}
              opponent={game.opponent}
              result={game.result}
              accuracy={game.accuracy}
              blunders={game.blunders}
              mistakes={game.mistakes}
            />
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
};
