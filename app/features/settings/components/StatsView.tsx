
/**
 * Stats View Component
 * features/settings/components/StatsView.tsx
 */
import { FeatureScreenLayout } from '@/ui/components';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';

export function StatsView() {
  // Example static stats
  const stats = [
    { label: 'Games Played', value: 128 },
    { label: 'Wins', value: 72 },
    { label: 'Draws', value: 18 },
    { label: 'Losses', value: 38 },
    { label: 'Rating', value: 1450 },
    { label: 'Best Streak', value: 7 },
  ];

  return (
    <FeatureScreenLayout
      title="Stats"
      subtitle="Your chess stats"
      statsRow={null}
    >
      <VStack gap={5} padding={2}>
        {stats.map((s, i) => (
          <Text key={i} size="lg" weight="semibold">
            {s.label}: {s.value}
          </Text>
        ))}
      </VStack>
    </FeatureScreenLayout>
  );
}
