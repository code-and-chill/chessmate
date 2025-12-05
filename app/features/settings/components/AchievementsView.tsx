/**
 * Achievements View Component
 * features/settings/components/AchievementsView.tsx
 * 
 * Refactored to use DLS primitives and tokens
 */

/**
 * Achievements View Component
 * features/settings/components/AchievementsView.tsx
 */
import { FeatureScreenLayout } from '@/ui/components';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';

export function AchievementsView() {
  // Example static achievements
  const achievements = [
    { icon: '🏆', title: 'First Win', desc: 'Win your first game.' },
    { icon: '🔥', title: 'Streak 5', desc: 'Win 5 games in a row.' },
    { icon: '💡', title: 'Puzzle Solver', desc: 'Solve 10 puzzles.' },
    { icon: '👑', title: 'Tournament Champ', desc: 'Win a tournament.' },
  ];

  return (
    <FeatureScreenLayout
      title="Achievements"
      subtitle="Your chess milestones"
      statsRow={null}
    >
      <VStack gap={5} padding={2}>
        {achievements.map((a, i) => (
          <VStack key={i} gap={1}>
            <Text size="lg" weight="bold">{a.icon} {a.title}</Text>
            <Text variant="caption" color="#737373">{a.desc}</Text>
          </VStack>
        ))}
      </VStack>
    </FeatureScreenLayout>
  );
}
