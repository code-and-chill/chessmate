import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import {VStack, HStack, Icon, FeatureScreenLayout, Panel, FeatureCard} from '@/ui';
import { StatCard } from '@/ui/components/StatCard';
import { useSocialStats } from '../hooks';
import type { SocialMode } from '../types';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

export interface SocialHubProps {
  onNavigate: (mode: SocialMode) => void;
  userId: string;
}

export function SocialHub({ onNavigate, userId }: SocialHubProps) {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const { stats, loading } = useSocialStats(userId);

  if (loading || !stats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <VStack justifyContent="center" alignItems="center" style={{ flex: 1 }} gap={4}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text variant="body" color={colors.foreground.secondary} style={{ marginTop: 20 }}>
            {t('common.loading')}
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <FeatureScreenLayout
      title={t('social.social')}
      subtitle={t('social.connect_with_community')}
      statsRow={(
        <Panel variant="glass" padding={6}>
          <VStack gap={5}>
            <Text variant="title" color={colors.foreground.primary}>
              {t('social.your_network', 'Your Network')}
            </Text>
            <HStack gap={4}>
              <StatCard value={stats.onlineFriends.toString()} label={t('social.online_friends')} />
              <StatCard value={stats.clubs.toString()} label={t('social.clubs')} />
            </HStack>
            <HStack gap={4}>
              <StatCard icon="chat" value={stats.unreadMessages.toString()} label={t('social.unread')} />
              <StatCard value={stats.globalRank?.toString() || 'N/A'} label={t('social.global_rank', 'Global Rank')} />
            </HStack>
          </VStack>
        </Panel>
      )}
      contentPadding={6}
      maxWidth={600}
    >
      <FeatureCard
        icon="friends"
        title={t('social.friends')}
        description={t('social.friends_description')}
        progress={ti('social.friend_count', { count: stats.totalFriends }) + ' • ' + ti('social.online_count', { count: stats.onlineFriends })}
        onPress={() => onNavigate('friends')}
        delay={300}
      />
      <FeatureCard
        icon="clubs"
        title={t('social.clubs')}
        description={t('social.clubs_description')}
        progress={ti('social.member_of_clubs', { count: stats.clubs })}
        onPress={() => onNavigate('clubs')}
        delay={400}
      />
      <FeatureCard
        icon="message"
        title={t('social.messages')}
        description={t('social.messages_description')}
        progress={ti('social.unread_messages', { count: stats.unreadMessages })}
        onPress={() => onNavigate('messages')}
        delay={500}
      />
      <FeatureCard
        icon="leaderboard"
        title={t('social.leaderboards')}
        description={t('social.leaderboards_description')}
        progress={ti('social.ranked_globally', { rank: stats.globalRank || 'N/A' })}
        onPress={() => onNavigate('leaderboard')}
        delay={600}
      />
    </FeatureScreenLayout>
  );
}
