/**
 * Stats View Component
 * features/settings/components/StatsView.tsx
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useUserStats } from '../hooks';

export interface StatsViewProps {
  onBack: () => void;
  userId: string;
}

/**
 * Statistics view with time control switching
 * Integrates with rating-api service
 */
export function StatsView({ onBack, userId }: StatsViewProps) {
  const [selectedTimeControl, setSelectedTimeControl] = useState<'blitz' | 'rapid' | 'classical'>('blitz');
  const { stats, loading } = useUserStats(userId, selectedTimeControl);

  if (loading && !stats) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#5856D6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Statistics</Text>
      <Text style={styles.subtitle}>Your chess performance</Text>

      {/* Time Control Tabs */}
      <View style={styles.categoryTabs}>
        <TouchableOpacity
          style={[styles.categoryTab, selectedTimeControl === 'blitz' ? styles.categoryTabActive : undefined]}
          onPress={() => setSelectedTimeControl('blitz')}
        >
          <Text style={[styles.categoryTabText, selectedTimeControl === 'blitz' ? styles.categoryTabTextActive : undefined]}>
            Blitz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryTab, selectedTimeControl === 'rapid' ? styles.categoryTabActive : undefined]}
          onPress={() => setSelectedTimeControl('rapid')}
        >
          <Text style={[styles.categoryTabText, selectedTimeControl === 'rapid' ? styles.categoryTabTextActive : undefined]}>
            Rapid
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryTab, selectedTimeControl === 'classical' ? styles.categoryTabActive : undefined]}
          onPress={() => setSelectedTimeControl('classical')}
        >
          <Text style={[styles.categoryTabText, selectedTimeControl === 'classical' ? styles.categoryTabTextActive : undefined]}>
            Classical
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rating Card */}
      <View style={styles.ratingCard}>
        <Text style={styles.ratingLabel}>Current Rating</Text>
        <Text style={styles.ratingValue}>{stats?.rating || 1650}</Text>
        <Text style={styles.ratingPeak}>Peak: {stats?.peak || 1720}</Text>
      </View>

      {/* Win/Loss Record */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Record</Text>
        <View style={styles.recordGrid}>
          <View style={styles.recordItem}>
            <Text style={styles.recordValue}>{stats?.games || 0}</Text>
            <Text style={styles.recordLabel}>Games</Text>
          </View>
          <View style={styles.recordItem}>
            <Text style={[styles.recordValue, { color: '#34C759' }]}>{stats?.wins || 0}</Text>
            <Text style={styles.recordLabel}>Wins</Text>
          </View>
          <View style={styles.recordItem}>
            <Text style={[styles.recordValue, { color: '#FF3B30' }]}>{stats?.losses || 0}</Text>
            <Text style={styles.recordLabel}>Losses</Text>
          </View>
          <View style={styles.recordItem}>
            <Text style={[styles.recordValue, { color: '#FF9F0A' }]}>{stats?.draws || 0}</Text>
            <Text style={styles.recordLabel}>Draws</Text>
          </View>
        </View>
        <View style={styles.winRateBar}>
          <View style={[styles.winRateFill, { width: `${stats?.winRate || 0}%` }]} />
        </View>
        <Text style={styles.winRateText}>{stats?.winRate.toFixed(1) || 0}% Win Rate</Text>
      </View>

      {/* Performance Insights */}
      {stats?.insights && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          <InsightRow icon="🎯" label="Best Opening" value={stats.insights.bestOpening} />
          <InsightRow icon="⚡" label="Average Move Time" value={stats.insights.avgMoveTime} />
          <InsightRow icon="🔥" label="Current Streak" value={stats.insights.currentStreak} />
          <InsightRow icon="📈" label="Rating Trend" value={stats.insights.ratingTrend} />
        </View>
      )}
    </ScrollView>
  );
}

function InsightRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.insightRow}>
      <Text style={styles.insightIcon}>{icon}</Text>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={styles.insightValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5856D6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: '#5856D6',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#5856D6',
    marginBottom: 4,
  },
  ratingPeak: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  recordGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  recordItem: {
    alignItems: 'center',
  },
  recordValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 12,
    color: '#666',
  },
  winRateBar: {
    height: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  winRateFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  winRateText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    textAlign: 'center',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 30,
  },
  insightLabel: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  insightValue: {
    fontSize: 14,
    color: '#5856D6',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
});
