import { useState } from 'react';
import { ScrollView } from 'react-native';
import { VStack, HStack, Text, Box, Card, SegmentedControl, useThemeTokens, spacingTokens, radiusTokens, shadowTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import { useLeaderboard } from '../hooks';
import type { LeaderboardType, LeaderboardEntry } from '@/types/social';
import { useReducedMotion } from '@/features/board/hooks/useReducedMotion';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface LeaderboardViewProps {
  onBack: () => void;
}

export function LeaderboardView({ onBack }: LeaderboardViewProps) {
  const { colors } = useThemeTokens();
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const [selectedType, setSelectedType] = useState<LeaderboardType>('global');
  const { entries, loading } = useLeaderboard(selectedType);

  const createAnim = (delay: number) => reduceMotion ? undefined : FadeInDown.delay(delay).duration(400);

  const segments: LeaderboardType[] = ['global', 'friends', 'club'];
  const segmentLabels = {
    global: t('social.global'),
    friends: t('social.friends'),
    club: t('social.clubs'),
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background.primary }} contentContainerStyle={{ padding: spacingTokens[5] }}>
      <VStack gap={4} style={{ maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        <VStack gap={2}>
          <Text variant="heading" color={colors.foreground.primary} style={{ marginBottom: spacingTokens[2] }}>{t('social.leaderboards')}</Text>
          <Text variant="body" color={colors.foreground.secondary} style={{ marginBottom: spacingTokens[5] }}>{t('social.see_where_you_rank')}</Text>
        </VStack>

        {/* Leaderboard Tabs */}
        <SegmentedControl
          segments={segments}
          selectedSegment={selectedType}
          onSegmentChange={setSelectedType}
          labelFormatter={(seg) => segmentLabels[seg]}
        />

        {loading ? (
          <Box style={{ marginTop: spacingTokens[7] }} alignItems="center">
            <Text variant="body" color={colors.foreground.secondary}>{t('social.loading_leaderboard')}</Text>
          </Box>
        ) : (
          <VStack gap={3} style={{ marginTop: spacingTokens[2] }}>
            {entries.map((entry, index) => (
              <Animated.View key={entry.rank} entering={createAnim(100 + index * 30)}>
                <LeaderboardEntryCard entry={entry} colors={colors} />
              </Animated.View>
            ))}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}

function LeaderboardEntryCard({ entry, colors }: { entry: LeaderboardEntry; colors: any }) {
  const isHighlighted = entry.highlight;
  return (
    <Card
      variant={isHighlighted ? 'elevated' : 'default'}
      size="md"
      style={{
        backgroundColor: isHighlighted ? colors.accent.primary : colors.background.secondary,
        borderWidth: isHighlighted ? 2 : 0,
        borderColor: isHighlighted ? colors.accent.primary : undefined,
        ...shadowTokens.card,
      }}
    >
      <Box flexDirection="row" alignItems="center" padding={spacingTokens[4]} gap={spacingTokens[3]}>
        <Box width={50} alignItems="flex-start">
          <Text variant="body" weight="bold" color={isHighlighted ? colors.foreground.onAccent : colors.foreground.secondary}>
            #{entry.rank}
          </Text>
        </Box>
        <Text variant="body" style={{ fontSize: 28, marginRight: spacingTokens[3] }}>{entry.avatar}</Text>
        <VStack gap={1} style={{ flex: 1 }}>
          <Text
            variant="body"
            weight={isHighlighted ? 'bold' : 'semibold'}
            color={isHighlighted ? colors.foreground.onAccent : colors.foreground.primary}
            style={{ marginBottom: spacingTokens[1] }}
          >
            {entry.username}
          </Text>
          <Text variant="caption" color={isHighlighted ? colors.foreground.onAccent : colors.foreground.secondary}>
            {entry.games.toLocaleString()} games • {entry.winRate}% win rate
          </Text>
        </VStack>
        <Text variant="heading" weight="bold" color={isHighlighted ? colors.foreground.onAccent : colors.foreground.primary}>
          {entry.rating}
        </Text>
      </Box>
    </Card>
  );
}
