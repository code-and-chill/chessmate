/**
 * Learn Hub Component
 * features/learn/components/LearnHub.tsx
 */

import { ScrollView } from 'react-native';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Card } from '@/ui/primitives/Card';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import type { LearnMode } from '../types/learn.types';
import { LearnCard } from './LearnCard';
import { StatsRow } from './StatsRow';

export type LearnHubProps = {
  onSelectMode: (mode: LearnMode) => void;
};

export const LearnHub: React.FC<LearnHubProps> = ({ onSelectMode }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <VStack style={{ padding: spacingTokens[6] }} gap={6}>
        <VStack gap={2}>
          <Text variant="heading" color={colors.foreground}>
            Learn & Improve
          </Text>
          <Text variant="body" color={colors.secondary}>
            Master chess through structured learning
          </Text>
        </VStack>

        <StatsRow streak={7} tacticsRating={1450} />

        <VStack gap={4}>
          <LearnCard
            icon="📚"
            title="Interactive Lessons"
            description="Structured courses from basics to advanced"
            progress="12 of 48 lessons completed"
            onPress={() => onSelectMode('lessons')}
          />

          <LearnCard
            icon="🎯"
            title="Tactics Trainer"
            description="Solve puzzles, improve pattern recognition"
            progress="Rating: 1450 • 234 solved"
            onPress={() => onSelectMode('tactics')}
          />

          <LearnCard
            icon="🔍"
            title="Game Review"
            description="Analyze your games, find improvements"
            progress="3 games pending review"
            onPress={() => onSelectMode('review')}
          />

          <LearnCard
            icon="📖"
            title="Openings Explorer"
            description="Study openings with statistics"
            progress="5 openings in repertoire"
            onPress={() => onSelectMode('openings')}
          />
        </VStack>
      </VStack>
    </ScrollView>
  );
};
