import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VStack, HStack, useThemeTokens } from '@/ui';
import { FeatureScreenLayout } from '@/ui/components/FeatureScreenLayout';
import { FeatureCard } from '@/ui/components/FeatureCard';
import { StatCard } from '@/ui/components/StatCard';
import { spacingTokens } from '@/ui/tokens/spacing';
import { useI18n } from '@/i18n/I18nContext';
import { PlayScreen } from '@/features/board';

export const PlayHubScreen: React.FC = () => {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const [mode, setMode] = useState<'hub' | 'game'>('hub');
  const [gameId] = useState('game-demo-1');
  const { t } = useI18n();

  if (mode === 'game') {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <PlayScreen gameId={gameId} />
      </SafeAreaView>
    );
  }

  return (
    <FeatureScreenLayout
      title={t('play.title', 'Play Chess')}
      subtitle={t('play.subtitle', 'Choose your game mode to get started')}
      statsRow={
        <VStack gap={4}>
          <HStack gap={3}>
            <StatCard icon="bolt" value="1450" label={t('play.rating', 'Rating')} />
            <StatCard icon="flame" value="7" label={t('play.streak', 'Streak')} />
          </HStack>
          <HStack gap={3}>
            <StatCard value="34" label={t('play.games', 'Games')} />
            <StatCard value="68%" label={t('play.winRate', 'Win Rate')} />
          </HStack>
        </VStack>
      }
    >
      <FeatureCard
        icon="globe"
        title={t('play.online.title', 'Online Play')}
        description={t('play.online.desc', 'Find opponents worldwide')}
        progress={t('play.online.progress', '1245 rating • 34 games')}
        onPress={() => router.push('/(tabs)/play/online')}
        delay={300}
      />
      <FeatureCard
        icon="robot"
        title={t('play.bot.title', 'Play vs Bot')}
        description={t('play.bot.desc', 'Practice with AI opponents')}
        progress={t('play.bot.progress', 'Level 5 • 12 games')}
        onPress={() => router.push('/(tabs)/play/bot')}
        delay={400}
      />
      <FeatureCard
        icon="users"
        title={t('play.friend.title', 'Friend Challenge')}
        description={t('play.friend.desc', 'Invite and play with friends')}
        progress={t('play.friend.progress', '8 friends online')}
        onPress={() => router.push('/(tabs)/play/friend')}
        delay={500}
      />
    </FeatureScreenLayout>
  );
};

export default PlayHubScreen;
