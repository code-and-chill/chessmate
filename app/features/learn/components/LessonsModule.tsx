/**
 * Lessons Module Component
 * features/learn/components/LessonsModule.tsx
 */

import { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import { LessonCard } from './LessonCard';
import { CategoryTabs } from './CategoryTabs';
import type { LessonCategory } from '../types/learn.types';

export type LessonsModuleProps = {
  onBack: () => void;
};

const LESSONS = {
  beginner: [
    { title: 'How Pieces Move', completed: true, time: '5 min' },
    { title: 'Basic Checkmates', completed: true, time: '10 min' },
    { title: 'Opening Principles', completed: false, time: '15 min' },
    { title: 'Pawn Structure Basics', completed: false, time: '12 min' },
  ],
  intermediate: [
    { title: 'Tactics: Forks & Pins', completed: true, time: '20 min' },
    { title: 'Endgame Essentials', completed: false, time: '25 min' },
    { title: 'Attacking the King', completed: false, time: '30 min' },
  ],
  advanced: [
    { title: 'Advanced Endgames', completed: false, time: '40 min' },
    { title: 'Positional Sacrifices', completed: false, time: '35 min' },
    { title: 'Modern Opening Theory', completed: false, time: '45 min' },
  ],
};

export const LessonsModule: React.FC<LessonsModuleProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<LessonCategory>('beginner');
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
    accent: getColor(colorTokens.blue[600], isDark),
  };

  const lessons = LESSONS[selectedCategory];

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
            Interactive Lessons
          </Text>
          <Text variant="body" color={colors.secondary}>
            Progress: 12/48 lessons • 🔥 7 day streak
          </Text>
        </VStack>

        <CategoryTabs
          categories={['beginner', 'intermediate', 'advanced']}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <VStack gap={3}>
          {lessons.map((lesson, idx) => (
            <LessonCard
              key={idx}
              title={lesson.title}
              completed={lesson.completed}
              time={lesson.time}
            />
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
};
