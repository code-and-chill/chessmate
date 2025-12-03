/**
 * Social Hub Component
 * features/social/components/SocialHub.tsx
 * 
 * Minimalist Pro Design - Glassmorphic social hub
 */

import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack, Icon } from '@/ui';
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={[styles.loaderText, { color: colors.foreground.secondary }]}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <VStack gap={1} style={styles.header}>
              <Text style={[styles.title, { color: colors.accent.primary }]}>{t('social.social')}</Text>
              <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('social.connect_with_community')}</Text>
            </VStack>
          </Animated.View>

          {/* Stats Panel */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card variant="gradient" size="md" style={{ padding: 20 }}>
              <VStack gap={4}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                  Your Network
                </Text>
                <HStack gap={3}>
                  <StatCard 
                    value={stats.onlineFriends.toString()} 
                    label={t('social.online_friends')} 
                  />
                  <StatCard 
                    value={stats.clubs.toString()} 
                    label={t('social.clubs')} 
                  />
                </HStack>
                <HStack gap={3}>
                  <StatCard
                    icon="chat"
                    value={stats.unreadMessages.toString()} 
                    label={t('social.unread')} 
                  />
                  <StatCard 
                    value={stats.globalRank?.toString() || 'N/A'} 
                    label="Global Rank" 
                  />
                </HStack>
              </VStack>
            </Card>
          </Animated.View>

          {/* Feature Cards */}
          <VStack gap={4}>
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Card variant="default" size="md" style={styles.card}>
                <TouchableOpacity style={styles.cardInner} onPress={() => onNavigate('friends')}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.accent.primary + '15' }]}>
                    <Icon name="friends" size={32} color={colors.accent.primary} />
                  </View>
                  <VStack gap={1} style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>
                      {t('social.friends')}
                    </Text>
                    <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>
                      {t('social.friends_description')}
                    </Text>
                    <Text style={[styles.cardProgress, { color: colors.accent.primary }]}>
                      {ti('social.friend_count', { count: stats.totalFriends })} • {ti('social.online_count', { count: stats.onlineFriends })}
                    </Text>
                  </VStack>
                  <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <Card variant="default" size="md" style={styles.card}>
                <TouchableOpacity style={styles.cardInner} onPress={() => onNavigate('clubs')}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.accent.primary + '15' }]}>
                    <Icon name="clubs" size={32} color={colors.accent.primary} />
                  </View>
                  <VStack gap={1} style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>
                      {t('social.clubs')}
                    </Text>
                    <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>
                      {t('social.clubs_description')}
                    </Text>
                    <Text style={[styles.cardProgress, { color: colors.accent.primary }]}>
                      {ti('social.member_of_clubs', { count: stats.clubs })}
                    </Text>
                  </VStack>
                  <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
              <Card variant="default" size="md" style={styles.card}>
                <TouchableOpacity style={styles.cardInner} onPress={() => onNavigate('messages')}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.accent.primary + '15' }]}>
                    <Icon name="message" size={32} color={colors.accent.primary} />
                  </View>
                  <VStack gap={1} style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>
                      {t('social.messages')}
                    </Text>
                    <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>
                      {t('social.messages_description')}
                    </Text>
                    <Text style={[styles.cardProgress, { color: colors.accent.primary }]}>
                      {ti('social.unread_messages', { count: stats.unreadMessages })}
                    </Text>
                  </VStack>
                  <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(400)}>
              <Card variant="default" size="md" style={styles.card}>
                <TouchableOpacity style={styles.cardInner} onPress={() => onNavigate('leaderboard')}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.accent.primary + '15' }]}>
                    <Icon name="leaderboard" size={32} color={colors.accent.primary} />
                  </View>
                    <VStack gap={1} style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>
                        {t('social.leaderboards')}
                      </Text>
                      <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>
                        {t('social.leaderboards_description')}
                      </Text>
                      <Text style={[styles.cardProgress, { color: colors.accent.primary }]}>
                        {ti('social.ranked_globally', { rank: stats.globalRank || 'N/A' })}
                      </Text>
                    </VStack>
                    <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
                  </TouchableOpacity>
                </Card>
              </Animated.View>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    paddingTop: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  card: {
    marginBottom: 12,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  cardProgress: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 17,
    marginTop: 20,
    fontWeight: '500',
  },
});
