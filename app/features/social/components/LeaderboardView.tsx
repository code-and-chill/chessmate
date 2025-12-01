/**
 * Leaderboard View Component
 * features/social/components/LeaderboardView.tsx
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLeaderboard } from '../hooks';
import type { LeaderboardType, LeaderboardEntry } from '../types';

export interface LeaderboardViewProps {
  onBack: () => void;
}

export function LeaderboardView({ onBack }: LeaderboardViewProps) {
  const [selectedType, setSelectedType] = useState<LeaderboardType>('global');
  const { entries, loading } = useLeaderboard(selectedType);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Leaderboards</Text>
      <Text style={styles.subtitle}>See where you rank</Text>

      {/* Leaderboard Tabs */}
      <View style={styles.categoryTabs}>
        <TouchableOpacity
          style={[styles.categoryTab, selectedType === 'global' && styles.categoryTabActive]}
          onPress={() => setSelectedType('global')}
        >
          <Text style={[styles.categoryTabText, selectedType === 'global' && styles.categoryTabTextActive]}>
            Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryTab, selectedType === 'friends' && styles.categoryTabActive]}
          onPress={() => setSelectedType('friends')}
        >
          <Text style={[styles.categoryTabText, selectedType === 'friends' && styles.categoryTabTextActive]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryTab, selectedType === 'club' && styles.categoryTabActive]}
          onPress={() => setSelectedType('club')}
        >
          <Text style={[styles.categoryTabText, selectedType === 'club' && styles.categoryTabTextActive]}>
            Club
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      ) : (
        entries.map(entry => <LeaderboardEntryCard key={entry.rank} entry={entry} />)
      )}
    </ScrollView>
  );
}

function LeaderboardEntryCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <View style={[styles.leaderboardEntry, entry.highlight && styles.leaderboardEntryHighlight]}>
      <Text style={styles.leaderboardRank}>#{entry.rank}</Text>
      <Text style={styles.leaderboardAvatar}>{entry.avatar}</Text>
      <View style={styles.leaderboardDetails}>
        <Text style={[styles.leaderboardName, entry.highlight && styles.leaderboardNameHighlight]}>
          {entry.username}
        </Text>
        <Text style={styles.leaderboardStats}>
          {entry.games.toLocaleString()} games • {entry.winRate}% win rate
        </Text>
      </View>
      <Text style={[styles.leaderboardRating, entry.highlight && styles.leaderboardRatingHighlight]}>
        {entry.rating}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { padding: 20 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 16 },
  backButtonText: { fontSize: 16, color: '#FF9F0A' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  loadingText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
  categoryTabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  categoryTab: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#f2f2f7', borderRadius: 8, alignItems: 'center' },
  categoryTabActive: { backgroundColor: '#FF9F0A' },
  categoryTabText: { fontSize: 14, fontWeight: '600', color: '#000' },
  categoryTabTextActive: { color: '#fff' },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leaderboardEntryHighlight: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FF9F0A',
  },
  leaderboardRank: { fontSize: 16, fontWeight: '700', color: '#666', width: 50 },
  leaderboardAvatar: { fontSize: 28, marginRight: 12 },
  leaderboardDetails: { flex: 1 },
  leaderboardName: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  leaderboardNameHighlight: { color: '#FF9F0A', fontWeight: '700' },
  leaderboardStats: { fontSize: 13, color: '#666' },
  leaderboardRating: { fontSize: 20, fontWeight: '700', color: '#000' },
  leaderboardRatingHighlight: { color: '#FF9F0A' },
});
