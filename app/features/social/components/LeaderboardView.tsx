/**
 * Leaderboard View Component
 * features/social/components/LeaderboardView.tsx
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import { useLeaderboard } from '../hooks';
import type { LeaderboardType, LeaderboardEntry } from '../types';

export interface LeaderboardViewProps {
  onBack: () => void;
}

export function LeaderboardView({ onBack }: LeaderboardViewProps) {
  const { colors } = useThemeTokens();
  const { t } = useI18n();
  const [selectedType, setSelectedType] = useState<LeaderboardType>('global');
  const { entries, loading } = useLeaderboard(selectedType);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('social.leaderboards')}</Text>
      <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('social.see_where_you_rank')}</Text>

      {/* Leaderboard Tabs */}
      <View style={styles.categoryTabs}>
        <TouchableOpacity
          style={[styles.categoryTab, { backgroundColor: colors.background.tertiary }, selectedType === 'global' && { backgroundColor: colors.accent.primary }]}
          onPress={() => setSelectedType('global')}
        >
          <Text style={[styles.categoryTabText, { color: colors.foreground.primary }, selectedType === 'global' && { color: colors.accentForeground.primary }]}>
            {t('social.global')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryTab, { backgroundColor: colors.background.tertiary }, selectedType === 'friends' && { backgroundColor: colors.accent.primary }]}
          onPress={() => setSelectedType('friends')}
        >
          <Text style={[styles.categoryTabText, { color: colors.foreground.primary }, selectedType === 'friends' && { color: colors.accentForeground.primary }]}>
            {t('social.friends')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryTab, { backgroundColor: colors.background.tertiary }, selectedType === 'club' && { backgroundColor: colors.accent.primary }]}
          onPress={() => setSelectedType('club')}
        >
          <Text style={[styles.categoryTabText, { color: colors.foreground.primary }, selectedType === 'club' && { color: colors.accentForeground.primary }]}>
            {t('social.clubs')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={[styles.loadingText, { color: colors.foreground.secondary }]}>{t('social.loading_leaderboard')}</Text>
      ) : (
        entries.map(entry => <LeaderboardEntryCard key={entry.rank} entry={entry} colors={colors} />)
      )}
    </ScrollView>
  );
}

function LeaderboardEntryCard({ entry, colors }: { entry: LeaderboardEntry; colors: any }) {
  return (
    <View style={[
      styles.leaderboardEntry,
      { backgroundColor: colors.background.secondary },
      entry.highlight && { backgroundColor: colors.accent.primary, borderWidth: 2, borderColor: colors.accent.primary }
    ]}>
      <Text style={[styles.leaderboardRank, { color: colors.foreground.secondary }]}>#{entry.rank}</Text>
      <Text style={styles.leaderboardAvatar}>{entry.avatar}</Text>
      <View style={styles.leaderboardDetails}>
        <Text style={[
          styles.leaderboardName,
          { color: colors.foreground.primary },
          entry.highlight && { color: colors.accent.primary, fontWeight: '700' }
        ]}>
          {entry.username}
        </Text>
        <Text style={[styles.leaderboardStats, { color: colors.foreground.secondary }]}>
          {entry.games.toLocaleString()} games • {entry.winRate}% win rate
        </Text>
      </View>
      <Text style={[
        styles.leaderboardRating,
        { color: colors.foreground.primary },
        entry.highlight && { color: colors.accent.primary }
      ]}>
        {entry.rating}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  loadingText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  categoryTabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  categoryTab: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  categoryTabText: { fontSize: 14, fontWeight: '600' },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leaderboardRank: { fontSize: 16, fontWeight: '700', width: 50 },
  leaderboardAvatar: { fontSize: 28, marginRight: 12 },
  leaderboardDetails: { flex: 1 },
  leaderboardName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  leaderboardStats: { fontSize: 13 },
  leaderboardRating: { fontSize: 20, fontWeight: '700' },
});
