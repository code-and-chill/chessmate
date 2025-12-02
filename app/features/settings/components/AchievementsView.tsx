/**
 * Achievements View Component
 * features/settings/components/AchievementsView.tsx
 * 
 * Refactored to use DLS primitives and tokens
 */

import { ScrollView, TouchableOpacity } from 'react-native';
import { VStack, Card, Text, useColors, Box, spacingTokens, typographyTokens } from '@/ui';

export interface AchievementsViewProps {
  onBack: () => void;
  userId: string;
}

const MOCK_ACHIEVEMENTS = [
  { id: 1, title: 'First Victory', description: 'Win your first game', unlocked: true, icon: '🎉', date: 'Nov 15, 2025' },
  { id: 2, title: '100 Games', description: 'Play 100 games', unlocked: true, icon: '💯', date: 'Nov 16, 2025' },
  { id: 3, title: 'Tactical Genius', description: 'Solve 50 puzzles', unlocked: true, icon: '🧩', date: 'Nov 17, 2025' },
  { id: 4, title: 'Rating Milestone', description: 'Reach 1600 rating', unlocked: true, icon: '📊', date: 'Nov 17, 2025' },
  { id: 5, title: 'Win Streak', description: 'Win 5 games in a row', unlocked: false, icon: '🔥', progress: '3/5' },
  { id: 6, title: '500 Games', description: 'Play 500 games', unlocked: false, icon: '🎮', progress: '456/500' },
  { id: 7, title: 'Checkmate Master', description: 'Deliver 100 checkmates', unlocked: false, icon: '♔', progress: '67/100' },
  { id: 8, title: 'Tournament Winner', description: 'Win a tournament', unlocked: false, icon: '🏆', progress: '0/1' },
];

export function AchievementsView({ onBack }: AchievementsViewProps) {
  const colors = useColors();
  const unlockedCount = MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <VStack gap={spacingTokens[5]} style={{ padding: spacingTokens[5] }}>
        <TouchableOpacity onPress={onBack}>
          <Text variant="body" color={colors.accent.primary}>← Back</Text>
        </TouchableOpacity>

        <VStack gap={spacingTokens[2]}>
          <Text variant="display" weight="bold" color={colors.foreground.primary}>
            Achievements
          </Text>
          <Text variant="body" color={colors.foreground.secondary}>
            {unlockedCount} of {totalCount} unlocked
          </Text>
        </VStack>

        {/* Progress Bar */}
        <VStack gap={spacingTokens[2]}>
          <Box
            style={{
              height: 12,
              backgroundColor: colors.background.tertiary,
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: colors.accent.primary,
                borderRadius: 6,
              }}
            />
          </Box>
          <Text variant="bodyMedium" color={colors.accent.primary} weight="semibold" style={{ textAlign: 'center' }}>
            {progressPercent}% Complete
          </Text>
        </VStack>

        {/* Unlocked Achievements */}
        <Text variant="title" weight="semibold" color={colors.foreground.primary}>
          Unlocked
        </Text>
        {MOCK_ACHIEVEMENTS.filter(a => a.unlocked).map(achievement => (
          <AchievementBadge key={achievement.id} {...achievement} />
        ))}

        {/* Locked Achievements */}
        <Text variant="title" weight="semibold" color={colors.foreground.primary}>
          In Progress
        </Text>
        {MOCK_ACHIEVEMENTS.filter(a => !a.unlocked).map(achievement => (
          <AchievementBadge key={achievement.id} {...achievement} />
        ))}
      </VStack>
    </ScrollView>
  );
}

function AchievementBadge({ title, description, unlocked, icon, date, progress }: {
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  date?: string;
  progress?: string;
}) {
  const colors = useColors();

  return (
    <Card variant="default" size="md" style={{ opacity: unlocked ? 1 : 0.6 }}>
      <Box flexDirection="row" alignItems="center" gap={spacingTokens[4]}>
        <Text style={{ fontSize: typographyTokens.fontSize['4xl'], opacity: unlocked ? 1 : 0.5 }}>
          {icon}
        </Text>
        <VStack flex={1} gap={spacingTokens[1]}>
          <Text 
            variant="body" 
            weight="semibold" 
            color={unlocked ? colors.foreground.primary : colors.foreground.secondary}
          >
            {title}
          </Text>
          <Text variant="bodyMedium" color={colors.foreground.secondary}>
            {description}
          </Text>
          {unlocked && date && (
            <Text variant="caption" color={colors.accent.primary} weight="medium">
              Unlocked on {date}
            </Text>
          )}
          {!unlocked && progress && (
            <Text variant="caption" color={colors.warning} weight="medium">
              Progress: {progress}
            </Text>
          )}
        </VStack>
      </Box>
    </Card>
  );
}
