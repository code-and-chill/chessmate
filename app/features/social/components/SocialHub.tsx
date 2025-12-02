/**
 * Social Hub Component
 * features/social/components/SocialHub.tsx
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.loadingText, { color: colors.foreground.secondary }]}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('social.social')}</Text>
      <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('social.connect_with_community')}</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Animated.View entering={FadeInDown.delay(0)} style={[styles.statCard, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.statValue, { color: colors.accent.primary }]}>{stats.onlineFriends}</Text>
          <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('social.online_friends')}</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.statCard, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.statValue, { color: colors.accent.primary }]}>{stats.clubs}</Text>
          <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('social.clubs')}</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200)} style={[styles.statCard, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.statValue, { color: colors.accent.primary }]}>{stats.unreadMessages}</Text>
          <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('social.unread')}</Text>
        </Animated.View>
      </View>

      {/* Main Cards */}
      <Animated.View entering={FadeInDown.delay(300)}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]} onPress={() => onNavigate('friends')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👥</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('social.friends')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('social.friends_description')}</Text>
              <Text style={[styles.cardProgress, { color: colors.accent.primary }]}>
                {ti('social.friend_count', { count: stats.totalFriends })} • {ti('social.online_count', { count: stats.onlineFriends })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]} onPress={() => onNavigate('clubs')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏆</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('social.clubs')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('social.clubs_description')}</Text>
              <Text style={[styles.cardProgress, { color: colors.accent.primary }]}>{ti('social.member_of_clubs', { count: stats.clubs })}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500)}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]} onPress={() => onNavigate('messages')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💬</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('social.messages')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('social.messages_description')}</Text>
              <Text style={[styles.cardProgress, { color: colors.accent.primary }]}>{ti('social.unread_messages', { count: stats.unreadMessages })}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]} onPress={() => onNavigate('leaderboard')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('social.leaderboards')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('social.leaderboards_description')}</Text>
              <Text style={[styles.cardProgress, { color: colors.accent.primary }]}>{ti('social.ranked_globally', { rank: stats.globalRank || 'N/A' })}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardProgress: {
    fontSize: 13,
    fontWeight: '500',
  },
});
