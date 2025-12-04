/**
 * Settings Hub - Main Entry Point
 * features/settings/components/SettingsHub.tsx
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import { useUserProfile, useUserStats } from '../hooks';
import type { SettingsMode } from '../types';

export interface SettingsHubProps {
  onNavigate: (mode: SettingsMode) => void;
  userId: string;
}

/**
 * Settings hub showing overview cards
 * Integrates with account-api and rating-api
 */
export function SettingsHub({ onNavigate, userId }: SettingsHubProps) {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const { profile, loading: profileLoading } = useUserProfile(userId);
  const { stats, loading: statsLoading } = useUserStats(userId, 'blitz');

  const loading = profileLoading || statsLoading;

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={[styles.loaderText, { color: colors.foreground.secondary }]}>{t('settings.loading_settings')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('settings.profile_settings')}</Text>
      <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('settings.customize_experience')}</Text>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.background.secondary }]}>
        <Text style={styles.profileAvatar}>{profile?.avatar || '♔'}</Text>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground.primary }]}>{profile?.username || t('settings.player')}</Text>
          <Text style={[styles.profileEmail, { color: colors.foreground.secondary }]}>{profile?.email || 'player@chess.com'}</Text>
          <Text style={[styles.profileJoined, { color: colors.foreground.muted }]}>
            {ti('settings.member_since', { date: profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Nov 2025' })}
          </Text>
        </View>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.statValue, { color: colors.accent.primary }]}>{stats?.rating || 1650}</Text>
          <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('settings.blitz_rating')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.statValue, { color: colors.accent.primary }]}>{stats?.games || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('settings.games_played')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.statValue, { color: colors.accent.primary }]}>{stats?.winRate.toFixed(0) || 0}%</Text>
          <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('settings.win_rate')}</Text>
        </View>
      </View>

      {/* Navigation Cards */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]} onPress={() => onNavigate('profile')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('settings.profile')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('settings.profile_description')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]} onPress={() => onNavigate('stats')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('settings.statistics')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('settings.statistics_description')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]} onPress={() => onNavigate('achievements')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏆</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('settings.achievements')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('settings.achievements_description')}</Text>
              <Text style={[styles.cardProgress, { color: colors.accent.primary }]}>{ti('settings.achievements_unlocked', { count: 12, total: 45 })}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(400)}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]} onPress={() => onNavigate('preferences')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚙️</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('settings.preferences')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('settings.preferences_description')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(500)}>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]} onPress={() => onNavigate('appearance')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎨</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('settings.appearance')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('settings.appearance_description')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(600)}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.background.secondary }]} 
          onPress={() => {
            console.log('Board Theme card pressed!');
            onNavigate('board-theme');
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>♟️</Text>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t('settings.board_theme')}</Text>
              <Text style={[styles.cardDescription, { color: colors.foreground.secondary }]}>{t('settings.board_theme_description')}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    fontSize: 64,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  profileJoined: {
    fontSize: 12,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
  },
});
